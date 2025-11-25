#!/usr/bin/env node
const fs = require('fs');
const bcrypt = require('bcryptjs');

function readMembers(filename) {
    const content = fs.readFileSync(filename, 'utf-8');
    return content.split('\n').filter(line => line.trim());
}

function createManittoChain(names) {
    const shuffled = [...names];
    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Create circular chain
    const chain = [];
    for (let i = 0; i < shuffled.length; i++) {
        const fromPerson = shuffled[i];
        const toPerson = shuffled[(i + 1) % shuffled.length];
        chain.push({ from: fromPerson, to: toPerson });
    }

    return chain;
}

async function generatePasswordHash(password) {
    return await bcrypt.hash(password, 10);
}

async function generateSQL(membersFile, outputFile) {
    // Read members
    const names = readMembers(membersFile);
    console.log(`Found ${names.length} members: ${names.join(', ')}`);

    // Create manitto chain
    const manittoChain = createManittoChain(names);
    console.log('\nManitto chain:');
    manittoChain.forEach(({ from, to }) => {
        console.log(`  ${from} -> ${to}`);
    });

    // Generate SQL
    const sqlLines = [];

    // Header
    sqlLines.push('-- Initialize users table with manitto assignments');
    sqlLines.push('-- Generated automatically by init_users.js');
    sqlLines.push('');

    // Clear existing data
    sqlLines.push('-- Clear existing data');
    sqlLines.push('DELETE FROM public.messages;');
    sqlLines.push('DELETE FROM public.push_tokens;');
    sqlLines.push('DELETE FROM public.users;');
    sqlLines.push('');

    // Insert users
    sqlLines.push('-- Insert users');
    const userData = {};

    for (const name of names) {
        const email = `${name}@kakaomobility.com`;
        const initialPassword = name;
        const passwordHash = await generatePasswordHash(initialPassword);

        sqlLines.push(
            `INSERT INTO public.users (name, email, initial_password, password_hash) ` +
            `VALUES ('${name}', '${email}', '${initialPassword}', '${passwordHash}');`
        );

        userData[name] = {
            email,
            initialPassword
        };
    }

    sqlLines.push('');

    // Update manitto relationships
    sqlLines.push('-- Update manitto relationships');
    manittoChain.forEach(({ from, to }) => {
        sqlLines.push(
            `UPDATE public.users ` +
            `SET manitto_to = (SELECT id FROM public.users WHERE name = '${to}') ` +
            `WHERE name = '${from}';`
        );
    });

    sqlLines.push('');

    // Set manitto_from (reverse relationship)
    manittoChain.forEach(({ from, to }) => {
        sqlLines.push(
            `UPDATE public.users ` +
            `SET manitto_from = (SELECT id FROM public.users WHERE name = '${from}') ` +
            `WHERE name = '${to}';`
        );
    });

    sqlLines.push('');
    sqlLines.push('-- Verify results');
    sqlLines.push('SELECT ');
    sqlLines.push('  u.name,');
    sqlLines.push('  u.email,');
    sqlLines.push('  u.initial_password,');
    sqlLines.push('  u_from.name as manitto_from,');
    sqlLines.push('  u_to.name as manitto_to');
    sqlLines.push('FROM public.users u');
    sqlLines.push('LEFT JOIN public.users u_from ON u.manitto_from = u_from.id');
    sqlLines.push('LEFT JOIN public.users u_to ON u.manitto_to = u_to.id');
    sqlLines.push('ORDER BY u.name;');

    // Write to file
    fs.writeFileSync(outputFile, sqlLines.join('\n'));

    console.log(`\nSQL script generated: ${outputFile}`);
    console.log('\nUser credentials:');
    names.forEach(name => {
        console.log(`  ${name}: ${userData[name].email} / ${userData[name].initialPassword}`);
    });
}

// Run
generateSQL('members.txt', 'init-users.sql')
    .then(() => console.log('\nDone!'))
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
