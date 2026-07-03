/**
 * Validation Service Tests
 * Version: 1.1
 */
function runValidationTests() {
    console.log('Running Validation Service Tests...');
    let passed = 0;
    let failed = 0;

    // Test 1: Email validation
    const validEmail = ValidationService.validateEmail('test@example.com');
    if (validEmail.valid) {
        console.log('✓ Test 1 passed: Email validation for valid email');
        passed++;
    } else {
        console.log(`✗ Test 1 failed: ${validEmail.message}`);
        failed++;
    }

    const invalidEmail = ValidationService.validateEmail('not-an-email');
    if (!invalidEmail.valid) {
        console.log('✓ Test 2 passed: Email validation for invalid email');
        passed++;
    } else {
        console.log('✗ Test 2 failed: Invalid email was marked valid');
        failed++;
    }

    // Test 2: Name validation
    const validName = ValidationService.validateName('John Doe');
    if (validName.valid) {
        console.log('✓ Test 3 passed: Name validation for valid name');
        passed++;
    } else {
        console.log(`✗ Test 3 failed: ${validName.message}`);
        failed++;
    }

    const invalidName = ValidationService.validateName('J');
    if (!invalidName.valid) {
        console.log('✓ Test 4 passed: Name validation for too-short name');
        passed++;
    } else {
        console.log('✗ Test 4 failed: Short name was marked valid');
        failed++;
    }

    console.log(`\nTests complete: ${passed} passed, ${failed} failed`);
    return { passed, failed };
}

// Auto-run tests
setTimeout(runValidationTests, 150);