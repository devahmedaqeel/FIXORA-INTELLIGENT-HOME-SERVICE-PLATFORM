// Must be imported before any application module so environment.js sees NODE_ENV=test.
process.env.NODE_ENV = 'test';
process.env.AI_PROVIDER = 'none';
process.env.EMAIL_PROVIDER = 'none';
process.env.PAYMENT_PROVIDER = 'cash';
