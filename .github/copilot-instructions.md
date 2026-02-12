# MSW Mock Generator Instructions

When I use the command `/msw` or ask to generate MSW mocks:
- Analyze any open API definition files and DTO types
- Generate MSW v2 handlers using `http` and `HttpResponse`
- Match response structure to DTO types exactly
- Include realistic mock data
- Add success and error case handlers
- Export handlers array
- also create an error case handler for each endpoint

Example format:
```typescript
import { http, HttpResponse } from 'msw'

export const fileNameMocking = [
  http.get('/api/endpoint', () => {
    return HttpResponse.json({ /* DTO-matched data */ })
  })
]
```

fileNameMocking is named [fileName]Mocking, following the API file name ([fileName].service.ts) 
or the corresponding mocking file name ([fileName].mocking.ts).
