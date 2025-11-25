#!/usr/bin/env python3
import random
import hashlib

def generate_password_hash(password: str) -> str:
    """Generate password hash using SHA-256"""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def read_members(filename: str) -> list[str]:
    """Read member names from file"""
    with open(filename, 'r') as f:
        return [line.strip() for line in f if line.strip()]

def create_manitto_chain(names: list[str]) -> list[tuple[str, str]]:
    """Create a circular chain of manitto relationships"""
    shuffled = names.copy()
    random.shuffle(shuffled)

    # Create circular chain: shuffled[0] -> shuffled[1] -> ... -> shuffled[n-1] -> shuffled[0]
    chain = []
    for i in range(len(shuffled)):
        from_person = shuffled[i]
        to_person = shuffled[(i + 1) % len(shuffled)]
        chain.append((from_person, to_person))

    return chain

def generate_sql(members_file: str, output_file: str):
    """Generate SQL script to initialize database"""

    # Read members
    names = read_members(members_file)
    print(f"Found {len(names)} members: {', '.join(names)}")

    # Create manitto chain
    manitto_chain = create_manitto_chain(names)
    print("\nManitto chain:")
    for from_person, to_person in manitto_chain:
        print(f"  {from_person} -> {to_person}")

    # Generate SQL
    sql_lines = []

    # Header
    sql_lines.append("-- Initialize users table with manitto assignments")
    sql_lines.append("-- Generated automatically by init_users.py")
    sql_lines.append("")

    # Clear existing data
    sql_lines.append("-- Clear existing data")
    sql_lines.append("DELETE FROM public.messages;")
    sql_lines.append("DELETE FROM public.push_tokens;")
    sql_lines.append("DELETE FROM public.users;")
    sql_lines.append("")

    # Insert users
    sql_lines.append("-- Insert users")
    user_data = {}
    for name in names:
        email = f"{name}@kakaomobility.com"
        initial_password = name
        password_hash = generate_password_hash(initial_password)

        sql_lines.append(
            f"INSERT INTO public.users (name, email, initial_password, password_hash) "
            f"VALUES ('{name}', '{email}', '{initial_password}', '{password_hash}');"
        )
        user_data[name] = {
            'email': email,
            'initial_password': initial_password
        }

    sql_lines.append("")

    # Update manitto relationships
    sql_lines.append("-- Update manitto relationships")
    for from_person, to_person in manitto_chain:
        sql_lines.append(
            f"UPDATE public.users "
            f"SET manitto_to = (SELECT id FROM public.users WHERE name = '{to_person}') "
            f"WHERE name = '{from_person}';"
        )

    sql_lines.append("")

    # Set manitto_from (reverse relationship)
    for from_person, to_person in manitto_chain:
        sql_lines.append(
            f"UPDATE public.users "
            f"SET manitto_from = (SELECT id FROM public.users WHERE name = '{from_person}') "
            f"WHERE name = '{to_person}';"
        )

    sql_lines.append("")
    sql_lines.append("-- Verify results")
    sql_lines.append("SELECT ")
    sql_lines.append("  u.name,")
    sql_lines.append("  u.email,")
    sql_lines.append("  u.initial_password,")
    sql_lines.append("  u_from.name as manitto_from,")
    sql_lines.append("  u_to.name as manitto_to")
    sql_lines.append("FROM public.users u")
    sql_lines.append("LEFT JOIN public.users u_from ON u.manitto_from = u_from.id")
    sql_lines.append("LEFT JOIN public.users u_to ON u.manitto_to = u_to.id")
    sql_lines.append("ORDER BY u.name;")

    # Write to file
    with open(output_file, 'w') as f:
        f.write('\n'.join(sql_lines))

    print(f"\nSQL script generated: {output_file}")
    print("\nUser credentials:")
    for name in names:
        print(f"  {name}: {user_data[name]['email']} / {user_data[name]['initial_password']}")

if __name__ == "__main__":
    generate_sql('members.txt', 'init-users.sql')
