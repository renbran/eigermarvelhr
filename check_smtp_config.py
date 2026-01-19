#!/usr/bin/env python3
import odoorpc

o = odoorpc.ODOO('localhost', port=8069)
o.login('eigermarvel', 'admin', '8586583')

# Check existing mail servers
MailServer = o.env['ir.mail_server']
servers = MailServer.search([])

print('='*70)
print('  OUTGOING MAIL SERVER CONFIGURATION')
print('='*70)
print()

if servers:
    for server_id in servers:
        server = MailServer.browse(server_id)
        print(f'📧 Server: {server.name}')
        print(f'   SMTP Host: {server.smtp_host}')
        print(f'   SMTP Port: {server.smtp_port}')
        print(f'   SMTP User: {server.smtp_user}')
        print(f'   SSL/TLS: {server.smtp_encryption}')
        print(f'   Active: {server.active}')
        print(f'   Sequence: {server.sequence}')
        print()
else:
    print('❌ No outgoing mail servers configured')
    print()

print('='*70)

# Now try sending test email with the configured server
if servers:
    print('\nAttempting to send test email using configured SMTP...\n')
    
    MailTemplate = o.env['mail.template']
    Client = o.env['recruitment.client']
    
    template = MailTemplate.search([('name', '=', 'Recruitment - Client Welcome')], limit=1)
    clients = Client.search([], limit=1)
    
    if template and clients:
        try:
            # Send mail with force_send=True to use SMTP immediately
            MailTemplate.send_mail(template[0], clients[0], True, {'email_to': 'renbranmadelo@gmail.com'})
            print('✅ Email sent successfully via configured SMTP!')
        except Exception as e:
            print(f'❌ Error sending: {str(e)[:200]}')
    else:
        print('⚠️  No test data available')
else:
    print('\n⚠️  Configure SMTP server first before testing email send')

print()
