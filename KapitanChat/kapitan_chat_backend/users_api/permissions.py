from rest_framework.permissions import BasePermission


class IsSelfRequest(BasePermission):
    def has_permission(self, request, view):
        id = view.kwargs.get('pk')
        return id == request.user.id
