# R13 notification contract

STATUS: **EXCLUSION — NOT IMPLEMENTED**
DATE: 3 October 2026

The bible names notifications and email. The frozen registry does not stamp a notification-send or email-delivery key as R13. `notification.read.own` is `R5+`. `emailaccount.manage` is `R6`. R12 already deferred a notification engine.

R13 therefore does not create notification intents, templates, deliveries, preferences, or an email provider. It does not claim that mail was sent. Declaring the `EMAIL` integration records intent only and verify fails closed.

A later release may design a notification engine. This file does not authorize one.
