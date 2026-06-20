from django.core.handlers.asgi import ASGIRequest
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import mixins, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, GenericViewSet

from .models import Message, Chat, Attachment, ChatType
from .serializers import MessageSerializer, ChatSerializer, AttachmentSerializer

from drf_spectacular.utils import extend_schema

# Create your views here.
@extend_schema(tags=['messages'])
class MessageView(ModelViewSet):
    """
    Пайплайн публікації повідомлення:
    Якщо повідомлення з вкладеним файлом ітд
        1. завантажити файл на сервіс для файлів, та отримати хеш
        2. завантажити attachment на сервер та отримати його id
        3. опублікувати повідомлення
    Якщо вкладення нема - просто завантажити повідомлення на сервер
    """
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer
    queryset = Message.objects.all()

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="chat",
                type=int,
                location='query',
                required=True,
            ),
            OpenApiParameter(
                name="offset",
                type=int,
                location='query',
                required=False,
            ),
            OpenApiParameter(
                name="limit",
                type=int,
                location='query',
                required=False,
            ),
            OpenApiParameter(
                name="reverse",
                type=bool,
                location='query',
                required=False,
            ),
        ]
    )
    def list(self, request: ASGIRequest, *args, **kwargs):
        if (chat_id := request.GET.get('chat')) is None:
            return Response({"error": "chat query parameter is required!"}, status=status.HTTP_400_BAD_REQUEST)
        limit = request.GET.get('limit', '0')
        offset = request.GET.get('offset', '0')
        reverse = request.GET.get('reverse', 'false').lower() == 'true'
        if not limit.isdigit():
            return Response({"error": "limit query parameter must be integer!"}, status=status.HTTP_400_BAD_REQUEST)
        if not offset.isdigit():
            return Response({"error": "offset query parameter must be integer!"}, status=status.HTTP_400_BAD_REQUEST)
        limit = int(limit)
        offset = int(offset)
        query_base = Message.objects.filter(chat_id=chat_id).order_by('id')
        if reverse:
            query_base = query_base.reverse()
        if limit > 0 and offset > 0:
            query_base = query_base[offset:limit+offset]
        elif limit > 0:
            query_base = query_base[:limit]
        elif offset > 0:
            query_base = query_base[offset:]

        return Response(MessageSerializer(query_base, many=True, request_user_id=request.user.id).data)

    def retrieve(self, request, *args, **kwargs):
        instance: Message = self.get_object()
        if request.user.id not in instance.chat.users:
            return Response(status=status.HTTP_403_FORBIDDEN)
        serializer = MessageSerializer(instance, request_user_id=request.user.id)
        return Response(serializer.data)

@extend_schema(tags=['chat'])
class ChatView(mixins.CreateModelMixin,
               mixins.RetrieveModelMixin,
               mixins.ListModelMixin,
               GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ChatSerializer
    queryset = Chat.objects.all()

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="reverse",
                type=bool,
                location='query',
                required=False,
            ),
        ]
    )
    def list(self, request, *args, **kwargs):
        query = Chat.objects.filter(users__id=request.user.id).order_by('updated_at')
        if request.GET.get('reverse', 'false').lower() == 'true':
            query = query.reverse()
        data = query.all()
        return Response(ChatSerializer(data, many=True, request_user_id=request.user.id).data)

    def retrieve(self, request, *args, **kwargs):
        instance: Chat = self.get_object()
        if request.user.id not in [us.id for us in instance.users.all()]:
            return Response(status=status.HTTP_403_FORBIDDEN)
        serializer = ChatSerializer(instance, request_user_id=request.user.id)
        return Response(serializer.data)

@extend_schema(tags=['attachments'])
class AttachmentView(ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AttachmentSerializer
    queryset = Attachment.objects.all()
