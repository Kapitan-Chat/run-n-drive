from typing import Any

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from rest_framework.exceptions import ValidationError

from chat_main_api.models import Message, Chat
from chat_main_api.serializers import MessageSerializer, ChatSerializer


class MainConsumer(AsyncJsonWebsocketConsumer):
    group_name = "chats_main"

    async def connect(self):
        if self.scope['user'].is_anonymous:
            await self.close()
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def chat_message_preprocess(self, content: dict[str, Any]):
        def create_message():
            if 'attachment_ids' not in content:
                content['attachment_ids'] = []
            s = MessageSerializer(data=content, request_user_id=self.scope['user'].id)
            s.is_valid(raise_exception=True)
            s = s.save()
            return s

        try:
            msg = await sync_to_async(create_message)()
        except ValidationError:
            return

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message',
                'message': await sync_to_async(lambda: MessageSerializer(msg).data, thread_sensitive=True)(),
            }
        )

    async def chat_message_edit_preprocess(self, content: dict[str, Any]):
        msg = await Message.objects.aget(id=content['id'])
        msg.content = content['content']
        msg.is_edited = True
        await msg.asave()

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message_edit',
                'message': await sync_to_async(lambda: MessageSerializer(msg, request_user_id=self.scope['user'].id).data, thread_sensitive=True)(),
            }
        )

    async def chat_message_delete_preprocess(self, content: dict[str, Any]):
        msg = await Message.objects.select_related('chat').aget(id=content['id'])
        chat = msg.chat
        await msg.adelete()

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message_delete',
                'message': {
                    'id': content['id'],
                    'chat': await sync_to_async(lambda: ChatSerializer(chat, request_user_id=self.scope['user'].id).data)(),
                },
            }
        )

    async def chat_message(self, event):
        message = event['message']
        if self.scope['user'].id not in message['chat']['users']: return
        await self.send_json({
            'type': 'message',
            'data': message
        })

    async def chat_message_edit(self, event):
        message = event['message']
        if self.scope['user'].id not in message['chat']['users']: return
        await self.send_json({
            'type': 'message_edit',
            'data': message
        })

    async def chat_message_delete(self, event):
        message = event['message']
        if self.scope['user'].id not in message['chat']['users']: return
        await self.send_json({
            'type': 'message_delete',
            'data': message
        })

    async def receive_json(self, content: dict[str, Any], **kwargs):
        print("Data just received!", content)  # TODO
        match (content['type']):
            case "message":
                await self.chat_message_preprocess(content['data'])
            case "message_edit":
                await self.chat_message_edit_preprocess(content['data'])
            case "message_delete":
                await self.chat_message_delete_preprocess(content['data'])
