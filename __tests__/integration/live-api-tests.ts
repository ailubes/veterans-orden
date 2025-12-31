/**
 * Live API Integration Tests
 *
 * Tests against deployed Netlify environment:
 * https://freepeople-new.netlify.app/
 *
 * These tests verify validation and error handling on live endpoints
 */

const BASE_URL = 'https://freepeople-new.netlify.app';

interface TestResult {
  endpoint: string;
  test: string;
  status: 'PASS' | 'FAIL';
  details?: string;
  response?: any;
}

const results: TestResult[] = [];

/**
 * Make API request and handle response
 */
async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`\n🌐 Testing: ${options.method || 'GET'} ${url}`);

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  return response;
}

/**
 * Test mobile auth sign-in validation
 */
async function testMobileAuthSignIn() {
  const endpoint = '/api/mobile/auth/sign-in';

  // Test 1: Missing required fields
  try {
    const response = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const data = await response.json();

    if (response.status === 400 && data.code === 'VALIDATION_ERROR') {
      results.push({
        endpoint,
        test: 'Missing required fields',
        status: 'PASS',
        details: `Got expected validation error with ${data.details.length} field errors`,
      });
    } else {
      results.push({
        endpoint,
        test: 'Missing required fields',
        status: 'FAIL',
        details: `Expected 400 with VALIDATION_ERROR, got ${response.status}`,
        response: data,
      });
    }
  } catch (error) {
    results.push({
      endpoint,
      test: 'Missing required fields',
      status: 'FAIL',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Test 2: Invalid email format
  try {
    const response = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'password123',
      }),
    });

    const data = await response.json();

    if (response.status === 400 && data.code === 'VALIDATION_ERROR') {
      const emailError = data.details.find((d: any) => d.field === 'email');
      if (emailError && emailError.message.includes('email')) {
        results.push({
          endpoint,
          test: 'Invalid email format',
          status: 'PASS',
          details: `Email validation works: "${emailError.message}"`,
        });
      } else {
        results.push({
          endpoint,
          test: 'Invalid email format',
          status: 'FAIL',
          details: 'Email error not found or incorrect message',
          response: data,
        });
      }
    } else {
      results.push({
        endpoint,
        test: 'Invalid email format',
        status: 'FAIL',
        details: `Expected 400 validation error, got ${response.status}`,
        response: data,
      });
    }
  } catch (error) {
    results.push({
      endpoint,
      test: 'Invalid email format',
      status: 'FAIL',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Test 3: Password too short
  try {
    const response = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'short',
      }),
    });

    const data = await response.json();

    if (response.status === 400 && data.code === 'VALIDATION_ERROR') {
      const passwordError = data.details.find((d: any) => d.field === 'password');
      if (passwordError && passwordError.message.includes('8 characters')) {
        results.push({
          endpoint,
          test: 'Password too short',
          status: 'PASS',
          details: `Password validation works: "${passwordError.message}"`,
        });
      } else {
        results.push({
          endpoint,
          test: 'Password too short',
          status: 'FAIL',
          details: 'Password error not found or incorrect message',
          response: data,
        });
      }
    } else {
      results.push({
        endpoint,
        test: 'Password too short',
        status: 'FAIL',
        details: `Expected 400 validation error, got ${response.status}`,
        response: data,
      });
    }
  } catch (error) {
    results.push({
      endpoint,
      test: 'Password too short',
      status: 'FAIL',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Test 4: Valid request (should fail auth, not validation)
  try {
    const response = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    if (response.status === 401) {
      results.push({
        endpoint,
        test: 'Valid request format',
        status: 'PASS',
        details: 'Validation passed, got 401 (auth failed) as expected',
      });
    } else if (response.status === 400) {
      results.push({
        endpoint,
        test: 'Valid request format',
        status: 'FAIL',
        details: 'Got 400 (validation error) instead of 401 (auth error)',
      });
    } else {
      results.push({
        endpoint,
        test: 'Valid request format',
        status: 'PASS',
        details: `Got ${response.status} (neither validation nor auth error)`,
      });
    }
  } catch (error) {
    results.push({
      endpoint,
      test: 'Valid request format',
      status: 'FAIL',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Test mobile auth sign-up validation
 */
async function testMobileAuthSignUp() {
  const endpoint = '/api/mobile/auth/sign-up';

  // Test 1: Missing all fields
  try {
    const response = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const data = await response.json();

    if (response.status === 400 && data.code === 'VALIDATION_ERROR') {
      const fieldCount = data.details.length;
      results.push({
        endpoint,
        test: 'Missing all required fields',
        status: 'PASS',
        details: `Got validation error with ${fieldCount} field errors`,
      });
    } else {
      results.push({
        endpoint,
        test: 'Missing all required fields',
        status: 'FAIL',
        details: `Expected 400 validation error, got ${response.status}`,
        response: data,
      });
    }
  } catch (error) {
    results.push({
      endpoint,
      test: 'Missing all required fields',
      status: 'FAIL',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Test 2: Invalid phone format
  try {
    const response = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        phone: '123456789', // Invalid - should be +380XXXXXXXXX
      }),
    });

    const data = await response.json();

    if (response.status === 400 && data.code === 'VALIDATION_ERROR') {
      const phoneError = data.details.find((d: any) => d.field === 'phone');
      if (phoneError && phoneError.message.includes('+380')) {
        results.push({
          endpoint,
          test: 'Invalid phone format',
          status: 'PASS',
          details: `Phone validation works: "${phoneError.message}"`,
        });
      } else {
        results.push({
          endpoint,
          test: 'Invalid phone format',
          status: 'FAIL',
          details: 'Phone error not found or incorrect message',
          response: data,
        });
      }
    } else {
      results.push({
        endpoint,
        test: 'Invalid phone format',
        status: 'FAIL',
        details: `Expected 400 validation error, got ${response.status}`,
        response: data,
      });
    }
  } catch (error) {
    results.push({
      endpoint,
      test: 'Invalid phone format',
      status: 'FAIL',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Test 3: Valid Ukrainian phone
  try {
    const response = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        phone: '+380501234567',
      }),
    });

    if (response.status !== 400) {
      results.push({
        endpoint,
        test: 'Valid Ukrainian phone',
        status: 'PASS',
        details: `Phone validation passed, got ${response.status}`,
      });
    } else {
      const data = await response.json();
      results.push({
        endpoint,
        test: 'Valid Ukrainian phone',
        status: 'FAIL',
        details: 'Valid phone rejected by validation',
        response: data,
      });
    }
  } catch (error) {
    results.push({
      endpoint,
      test: 'Valid Ukrainian phone',
      status: 'FAIL',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Test refresh token validation
 */
async function testRefreshToken() {
  const endpoint = '/api/mobile/auth/refresh';

  // Test 1: Missing refresh_token
  try {
    const response = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const data = await response.json();

    if (response.status === 400 && data.code === 'VALIDATION_ERROR') {
      const tokenError = data.details.find((d: any) => d.field === 'refresh_token');
      if (tokenError) {
        results.push({
          endpoint,
          test: 'Missing refresh_token',
          status: 'PASS',
          details: 'Validation caught missing refresh_token',
        });
      } else {
        results.push({
          endpoint,
          test: 'Missing refresh_token',
          status: 'FAIL',
          details: 'refresh_token error not found',
          response: data,
        });
      }
    } else {
      results.push({
        endpoint,
        test: 'Missing refresh_token',
        status: 'FAIL',
        details: `Expected 400 validation error, got ${response.status}`,
        response: data,
      });
    }
  } catch (error) {
    results.push({
      endpoint,
      test: 'Missing refresh_token',
      status: 'FAIL',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Test 2FA verification validation
 */
async function test2FAVerification() {
  const endpoint = '/api/mobile/auth/2fa/verify';

  // Test 1: Invalid code format
  try {
    const response = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        factor_id: 'factor-123',
        code: '123', // Invalid - must be 6 digits
        challenge_id: 'challenge-123',
      }),
    });

    const data = await response.json();

    if (response.status === 400 && data.code === 'VALIDATION_ERROR') {
      const codeError = data.details.find((d: any) => d.field === 'code');
      if (codeError && codeError.message.includes('6 digits')) {
        results.push({
          endpoint,
          test: 'Invalid 2FA code format',
          status: 'PASS',
          details: `Code validation works: "${codeError.message}"`,
        });
      } else {
        results.push({
          endpoint,
          test: 'Invalid 2FA code format',
          status: 'FAIL',
          details: 'Code error not found or incorrect message',
          response: data,
        });
      }
    } else {
      results.push({
        endpoint,
        test: 'Invalid 2FA code format',
        status: 'FAIL',
        details: `Expected 400 validation error, got ${response.status}`,
        response: data,
      });
    }
  } catch (error) {
    results.push({
      endpoint,
      test: 'Invalid 2FA code format',
      status: 'FAIL',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Print results summary
 */
function printResults() {
  console.log('\n\n' + '='.repeat(80));
  console.log('📊 API VALIDATION TEST RESULTS');
  console.log('='.repeat(80));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;

  console.log(`\n✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);
  console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  console.log('\n' + '-'.repeat(80));
  console.log('DETAILED RESULTS:');
  console.log('-'.repeat(80));

  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`\n${icon} ${result.endpoint}`);
    console.log(`   Test: ${result.test}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Details: ${result.details}`);

    if (result.response && result.status === 'FAIL') {
      console.log(`   Response:`, JSON.stringify(result.response, null, 2));
    }
  });

  console.log('\n' + '='.repeat(80));
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Live API Integration Tests');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('⏱️  This may take a minute...\n');

  try {
    await testMobileAuthSignIn();
    await testMobileAuthSignUp();
    await testRefreshToken();
    await test2FAVerification();

    printResults();

    // Exit with appropriate code
    const hasFailed = results.some(r => r.status === 'FAIL');
    process.exit(hasFailed ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests();
}

export { runAllTests, results };
