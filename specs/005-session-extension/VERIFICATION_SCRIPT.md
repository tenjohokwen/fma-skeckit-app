# Token Response Verification Script

**Purpose**: Verify that search and create endpoints return proper token data

---

## Quick Test Commands

### Test 1: Client Search
Open your browser console and run:

```javascript
// Test client search
fetch('YOUR_API_URL', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
  },
  body: JSON.stringify({
    action: 'client.search',
    data: {
      firstName: 'John'
    }
  })
})
.then(r => r.json())
.then(response => {
  console.log('=== CLIENT SEARCH RESPONSE ===');
  console.log('Status:', response.status);
  console.log('MsgKey:', response.msgKey);
  console.log('Has Data:', !!response.data);
  console.log('Has Token:', !!response.token);

  if (response.token) {
    console.log('✅ Token Present');
    console.log('  - Value:', response.token.value ? 'Present' : 'MISSING');
    console.log('  - TTL:', response.token.ttl ? new Date(response.token.ttl) : 'MISSING');
    console.log('  - Username:', response.token.username || 'MISSING');
  } else {
    console.error('❌ TOKEN MISSING FROM RESPONSE');
  }

  console.log('\nFull Response:', JSON.stringify(response, null, 2));
});
```

### Test 2: Case Search
```javascript
// Test case search
fetch('YOUR_API_URL', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
  },
  body: JSON.stringify({
    action: 'metadata.searchCasesByName',
    data: {
      firstName: 'Test'
    }
  })
})
.then(r => r.json())
.then(response => {
  console.log('=== CASE SEARCH RESPONSE ===');
  console.log('Status:', response.status);
  console.log('Has Token:', !!response.token);

  if (response.token) {
    console.log('✅ TOKEN PRESENT');
    console.log(JSON.stringify(response.token, null, 2));
  } else {
    console.error('❌ TOKEN MISSING');
  }

  console.log('\nFull Response:', JSON.stringify(response, null, 2));
});
```

### Test 3: Client Create
```javascript
// Test client create
fetch('YOUR_API_URL', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
  },
  body: JSON.stringify({
    action: 'client.create',
    data: {
      firstName: 'Test',
      lastName: 'User',
      nationalId: 'TEST123'
    }
  })
})
.then(r => r.json())
.then(response => {
  console.log('=== CLIENT CREATE RESPONSE ===');
  console.log('Status:', response.status);
  console.log('Has Token:', !!response.token);

  if (response.token) {
    console.log('✅ TOKEN PRESENT');
    console.log(JSON.stringify(response.token, null, 2));
  } else {
    console.error('❌ TOKEN MISSING');
  }

  console.log('\nFull Response:', JSON.stringify(response, null, 2));
});
```

---

## Expected Response Format

Every response should have this structure:

```javascript
{
  "status": 200,
  "msgKey": "client.search.success",
  "message": "Found X client(s)",
  "data": {
    // Method-specific data
  },
  "token": {
    "value": "ENCRYPTED_JWT_STRING_HERE",
    "ttl": 1760697849187,
    "username": "user@example.com"
  }
}
```

---

## Troubleshooting

### Issue 1: Token is Null or Undefined

**Possible Causes**:
1. Deployment didn't complete successfully
2. Google Apps Script still using cached old version
3. Error in TokenManager.generateToken()

**Solutions**:
1. Re-deploy: `cd gas && npx clasp push --force`
2. Check Google Apps Script logs for errors
3. Verify TokenManager is working: Test with `auth.ping`

### Issue 2: Token Has Wrong Structure

**Expected Structure**:
```javascript
token: {
  value: string,  // Encrypted JWT
  ttl: number,    // Unix timestamp
  username: string // User email
}
```

**Check**:
- `value` should be a long encrypted string
- `ttl` should be ~15 minutes in the future
- `username` should match logged-in user's email

### Issue 3: Token Value is Empty String

**Cause**: TokenManager.generateToken() returned empty or null value

**Solution**: Check TokenManager.gs for errors

---

## Debugging Steps

### Step 1: Check Deployed Code

1. Go to https://script.google.com/
2. Open your project (ID: from .clasp.json)
3. Open `handlers/ClientHandler.gs`
4. Verify line 62 has:
   ```javascript
   const newToken = TokenManager.generateToken(context.user.email);
   ```
5. Verify line 64-78 has:
   ```javascript
   return ResponseHandler.successWithToken(
     'client.search.success',
     `Found ${matchedClients.length} client(s)`,
     {...},
     context.user,
     newToken.value
   );
   ```

### Step 2: Check Google Apps Script Logs

1. In Google Apps Script editor, click "Executions"
2. Find recent execution for your search/create request
3. Check for errors related to:
   - `TokenManager is not defined`
   - `generateToken is not a function`
   - `context.user is undefined`

### Step 3: Test auth.ping (Known Working Endpoint)

```javascript
fetch('YOUR_API_URL', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
  },
  body: JSON.stringify({
    action: 'auth.ping',
    data: {}
  })
})
.then(r => r.json())
.then(response => {
  console.log('=== AUTH.PING RESPONSE ===');
  console.log('Has Token:', !!response.token);
  if (response.token) {
    console.log('✅ auth.ping works correctly');
    console.log('This means TokenManager is working');
    console.log('Issue might be specific to search/create handlers');
  }
  console.log(JSON.stringify(response, null, 2));
});
```

If `auth.ping` returns token but search/create don't, then the deployment might not have updated those specific handlers.

### Step 4: Force Refresh Google Apps Script Cache

Sometimes Google Apps Script caches old code. To force refresh:

1. Go to https://script.google.com/
2. Open your project
3. Click "Deploy" → "Manage deployments"
4. Click "Edit" (pencil icon) on your web app deployment
5. Change "Version" to "New version"
6. Add description: "Force refresh with token updates"
7. Click "Deploy"
8. Test again

---

## Manual Verification Checklist

Test each endpoint and check the response:

### Client Operations
- [ ] `client.search` - Returns token ✓
- [ ] `client.create` - Returns token ✓
- [ ] `client.get` - Returns token ✓
- [ ] `client.update` - Returns token ✓

### Case/Metadata Operations
- [ ] `metadata.searchCasesByName` - Returns token ✓
- [ ] `metadata.searchCaseByCaseId` - Returns token ✓
- [ ] `metadata.getCaseForEdit` - Returns token ✓
- [ ] `metadata.updateCaseMetadata` - Returns token ✓
- [ ] `metadata.createCaseMetadata` - Returns token ✓

### Case Creation
- [ ] `case.create` - Returns token ✓

### File Operations
- [ ] `file.searchClientFolder` - Returns token ✓
- [ ] `file.createClientFolder` - Returns token ✓
- [ ] `file.listFolderContents` - Returns token ✓

---

## Contact

If issues persist after following all troubleshooting steps:

1. Check Google Apps Script execution logs
2. Verify the script version deployed
3. Try creating a new deployment version
4. Check if there are any authorization prompts blocking execution

---

**Last Updated**: 2025-10-17
