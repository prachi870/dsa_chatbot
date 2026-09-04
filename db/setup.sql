-- Create the app user if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'user') THEN
    CREATE USER "user" WITH PASSWORD 'password';
  END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE dsa_chatbot TO "user";
GRANT ALL ON SCHEMA public TO "user";
