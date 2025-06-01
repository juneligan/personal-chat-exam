
### Setup
```
- npm install
- npm run dev
- Make sure you have a `.env` file with the following variables:
```

### For generating the SQL queries using prisma
```
npx prisma migrate dev --name init
```

### Sample Login CURL
```
curl -X POST http://localhost:5000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"john@mail.com","password":""}'      
```

### Sample Registration CURL
```
curl -X POST http://localhost:5000/api/auth/register \
-H "Content-Type: application/json" \
-d '{"username": "john4", "email":"john4@mail.com","password":"1234qwer"}'
```

### WebSocket testing
```
 npx ts-node socket-test.ts  
```