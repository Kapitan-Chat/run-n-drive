from django.contrib.auth.models import User
from django.db.models import Q
from django.http import HttpRequest, HttpResponse
from drf_spectacular.utils import extend_schema, OpenApiParameter, inline_serializer
from rest_framework import status, serializers
from rest_framework.decorators import action
from rest_framework.generics import CreateAPIView, RetrieveAPIView, ListAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
import logging

from rest_framework.viewsets import ViewSet

from chat_main_api.models import Chat
from .models import Profile
from .permissions import IsSelfRequest
from .serializers import RegisterSerializer, UserSerializer, ProfileSerializer

logger = logging.getLogger(__name__)


# Create your views here.
class RegisterView(CreateAPIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class GetMe(APIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    def get(self, request: Request) -> Response:
        user = request.user
        logger.info(f"Idk {user.id} {user}")
        user = User.objects.get(id=user.id)
        logger.info(user)
        serialized = (UserSerializer(user)
                      .data)
        logger.info(serialized)
        return Response(serialized, status=status.HTTP_200_OK)


class Users(RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def get(self, request, *args, **kwargs):
        _id = self.kwargs['pk']
        chat = Chat.objects.filter(users__id=_id).filter(users__id=request.user.id).all()
        if len(chat) == 0:
            return Response(status=status.HTTP_404_NOT_FOUND)

        return super().get(request, *args, **kwargs)


class SearchApiView(RetrieveAPIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="query",
                type=str,
                location='query',
                required=True,
            )
        ]
    )
    def get(self, request: HttpRequest, *args, **kwargs) -> HttpResponse:
        query = request.GET.get('query', None)
        if not query or query == '':
            return Response({'message': 'request must contains query'}, status=status.HTTP_400_BAD_REQUEST)
        if len(query) < 3:
            return Response({'message': 'query must be at least 3 characters'}, status=status.HTTP_400_BAD_REQUEST)
        users = User.objects.filter(Q(username__icontains=query) | Q(profile__phone_number=query) | Q(email=query))[:5]
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class ProfileView(UpdateAPIView):
    permission_classes = (IsAuthenticated, IsSelfRequest)
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer


class ValidationViewSet(ViewSet):
    __SuccessResponse__ = inline_serializer(
        name='Success',
        fields={
            "available": serializers.BooleanField(),
        }
    )
    __ErrorResponse__ = inline_serializer(
        name='ValidationError',
        fields={
            "error": serializers.CharField(),
        }
    )
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="nickname",
                type=str,
                location='query',
                required=True,
            ),
        ],
        responses={
            200: __SuccessResponse__,
            422: __ErrorResponse__,
        }
    )
    @action(detail=False, methods=['get'])
    def nickname(self, request: Request):
        nickname = request.query_params.get('nickname', None)
        if nickname:
            exists = User.objects.filter(username__iexact=nickname).exists()
            return Response({"available": not exists}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "nickname query parameter is required!"},
                            status=status.HTTP_422_UNPROCESSABLE_ENTITY)

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="phone",
                type=str,
                location='query',
                required=True,
            ),
        ],
        responses={
            200: __SuccessResponse__,
            422: __ErrorResponse__,
        }
    )
    @action(detail=False, methods=['get'])
    def phone(self, request: Request):
        phone = request.query_params.get('phone', None)
        if phone:
            exists = Profile.objects.filter(phone_number__iexact=phone).exists()
            return Response({"available": not exists}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "phone query parameter is required!"},
                            status=status.HTTP_422_UNPROCESSABLE_ENTITY)

    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="email",
                type=str,
                location='query',
                required=True,
            ),
        ],
        responses={
            200: __SuccessResponse__,
            422: __ErrorResponse__,
        }
    )
    @action(detail=False, methods=['get'])
    def email(self, request: Request):
        email = request.query_params.get('email', None)
        if email:
            exists = User.objects.filter(email__iexact=email).exists()
            return Response({"available": not exists}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "email query parameter is required!"},
                            status=status.HTTP_422_UNPROCESSABLE_ENTITY)
