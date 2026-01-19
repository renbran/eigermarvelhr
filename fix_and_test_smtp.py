#!/usr/bin/env python3
import odoorpc

o = odoorpc.ODOO('localhost', port=8069)
o.login('eigermarvel', 'admin', '8586583')

MailServer = o.env['ir.mail_server']

# Find the Moosend server with typo
servers = MailServer.search([('smtp_host', '=', 'smpt.mailendo.com')])

if servers:
    print('Found Moosend server with typo in hostname')
    print('Fixing: smpt.mailendo.com → smtp.mailendo.com')
    
    # Update the server
    MailServer.write(servers, {
        'smtp_host': 'smtp.mailendo.com',
        'smtp_port': 587,
        'smtp_encryption': 'starttls',
        'sequence': 1,  # Make it the default (lowest sequence = highest priority)
    })
    print('✅ Moosend SMTP server updated successfully')
    print()
    
    # Verify the update
    server = MailServer.browse(servers[0])
    print('Updated configuration:')
    print(f'  Name: {server.name}')
    print(f'  Host: {server.smtp_host}')
    print(f'  Port: {server.smtp_port}')
    print(f'  User: {server.smtp_user}')
    print(f'  Encryption: {server.smtp_encryption}')
    print(f'  Sequence: {server.sequence} (priority)')
    print()
else:
    print('⚠️  Moosend server with typo not found')
    print('Checking for correct hostname...')
    
    correct_servers = MailServer.search([('smtp_host', '=', 'smtp.mailendo.com')])
    if correct_servers:
        print('✅ Moosend server already has correct hostname')
        # Make it priority
        MailServer.write(correct_servers, {'sequence': 1})
        print('✅ Set as priority mail server')
    else:
        print('❌ No Moosend server found')

print()
print('='*70)
print('Now testing email send with Moosend SMTP...')
print('='*70)
print()

# Test sending email
MailTemplate = o.env['mail.template']
Client = o.env['recruitment.client']

template = MailTemplate.search([('name', '=', 'Recruitment - Client Welcome')], limit=1)
clients = Client.search([], limit=1)

if template and clients:
    try:
        print('Sending test email to: renbranmadelo@gmail.com')
        MailTemplate.send_mail(template[0], clients[0], True, {'email_to': 'renbranmadelo@gmail.com'})
        print()
        print('✅ EMAIL SENT SUCCESSFULLY!')
        print()
        print('📧 Check renbranmadelo@gmail.com for the Client Welcome email')
        print()
    except Exception as e:
        error_msg = str(e)
        print(f'❌ Error: {error_msg[:300]}')
        print()
        if 'SSL' in error_msg or 'TLS' in error_msg:
            print('💡 Tip: SSL/TLS configuration issue detected')
            print('   Try using STARTTLS on port 587 instead of SSL on port 465')
        print()
else:
    print('⚠️  No test data available (client record needed)')
