from django.contrib.auth.models import User
from django.db import models

# Create your models here.
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(max_length=256, blank=True)
    phone_number = models.CharField(max_length=16, blank=False, unique=True)
    profile_picture_id = models.CharField(max_length=64, blank=True, null=True)