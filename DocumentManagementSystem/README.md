# Get Token

```bash
curl http://localhost/auth/google/signin
```

# Upload File

```bash
curl -X POST http://localhost/api/documents/upload/3df15081-762b-4f07-bde9-6d3ad3281582 -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMTQ3NzMyMDYxODQyNjI3NDU2NDIiLCJuYW1lIjoiY2hhZWppbiIsImVtYWlsIjoibHVrYXNkZXZlbG9wZXJhY2NAZ21haWwuY29tIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0s1bHY0M3BqRmdJRmNQU21XM20zaExLODVLbURSaGloLUhJOWRaUXNRbFJYTHplQT1zOTYtYyIsImlhdCI6MTc0Njc3NzEwNywiZXhwIjoxNzQ2NzgwNzA3fQ.1Ki4VzWgfXhLXAcWRoUnkFVfgPy68wIGiRiQIaae86M" -F "file=@./sample.pdf"
```
