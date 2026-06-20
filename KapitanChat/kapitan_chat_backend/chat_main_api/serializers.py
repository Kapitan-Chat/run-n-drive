from __future__ import annotations
from datetime import datetime, timezone
from typing import Any, Optional

from django.contrib.auth.models import User
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from rest_framework.fields import empty

from users_api.serializers import UserSerializer
from .models import Message, Chat, Attachment, ChatType

# hack to show message model in last_message
class MessageSerializerNoChat(serializers.ModelSerializer):
    class Meta:
        model = Message
        exclude = ('chat',)

class ChatSerializer(serializers.ModelSerializer):
    last_message: Message = serializers.SerializerMethodField(read_only=True)

    def __init__(self, instance=None, data=empty, **kwargs):
        self.request_user_id = kwargs.pop('request_user_id', None)
        super().__init__(instance, data, **kwargs)

    def validate(self, data: dict[str, Any]) -> dict[str, Any]:
        if data['created_by'] not in data['users']:
            raise serializers.ValidationError("Chat must include user that created it")
        if data['type'] == ChatType.DIRECT:
            if len(data['users']) != 2:
                raise serializers.ValidationError("DIRECT chat can only have 2 users.")
            if 'name' in data:
                raise serializers.ValidationError("DIRECT chat cant have name.")
            if 'description' in data:
                raise serializers.ValidationError("DIRECT chat cant have description.")
            if Chat.objects.filter(users__id=data['users'][0].id).filter(users__id=data['users'][1].id).filter(type=ChatType.DIRECT).exists():
                raise serializers.ValidationError("Chat already exists.")
        else:
            if not 'name' in data:
                raise serializers.ValidationError(data['type'] + " should have name.")

        return data

    def to_representation(self, instance: Chat):
        if self.request_user_id and instance.type == ChatType.DIRECT:
            for u in instance.users.all():
                if u.id != self.request_user_id:
                    instance.name = u.first_name + (" " + u.last_name if u.last_name else "")
                    instance.description = u.profile.bio
        res = super().to_representation(instance)
        return res

    @extend_schema_field(MessageSerializerNoChat)
    def get_last_message(self, instance: Chat) -> MessageSerializer:
        msg = instance.messages.last()
        return MessageSerializer(msg, include_chat=False).data if msg else None

    class Meta:
        model = Chat
        fields = '__all__'


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = '__all__'


class MessageSerializer(serializers.ModelSerializer):
    user: User = UserSerializer(read_only=True)
    user_id: int = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True, source='user')
    attachments: list[Attachment] = AttachmentSerializer(many=True, allow_null=True)
    chat_id: int = serializers.PrimaryKeyRelatedField(write_only=True, required=True, queryset=Chat.objects.all(), source='chat')
    chat: Chat = serializers.SerializerMethodField(read_only=True)

    def __init__(self, instance=None, data=empty, include_chat=True, **kwargs):
        self.request_user_id = kwargs.pop('request_user_id', None)
        self.include_chat = include_chat
        super().__init__(instance, data, **kwargs)

    def validate(self, attributes: dict[str, Any]) -> dict[str, Any]:
        if not Chat.objects.filter(users__id=attributes['user'].id, id=attributes['chat'].id).exists():
            raise serializers.ValidationError("Message publisher should be related to chat.")
        return attributes

    def create(self, validated_data: dict[str, Any]) -> Message:
        attachments = validated_data.pop('attachments', [])
        message = Message.objects.create(**validated_data)
        if attachments:
            attachments = [Attachment.objects.create(**obj) for obj in attachments]
            for a in attachments:
                a.message = message
                a.save()
        message.chat.updated_at = datetime.now(tz=timezone.utc)
        message.chat.save()

        return message

    @extend_schema_field(ChatSerializer)
    def get_chat(self, instance: Message):
        if not self.include_chat: return None
        return ChatSerializer(instance.chat, read_only=True, request_user_id=self.request_user_id).data

    class Meta:
        model = Message
        fields = '__all__'