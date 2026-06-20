import random

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Profile

@receiver(post_save, sender=User)
def create_user_profile(sender, instance: User, created: bool, **kwargs):
    if created:
        Profile.objects.create(
            user=instance,
            # create random phone number for newly created user to prevent errors when creating superuser
            phone_number="+0 " + "".join([random.choice("0123456789") for _ in range(10)])
        )