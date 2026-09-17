<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'selcom' => [
        'base_url' => env('SELCOM_BASE_URL', 'https://sandbox.selcom.net/v1'),
        'api_key' => env('SELCOM_API_KEY'),
        'secret_key' => env('SELCOM_SECRET_KEY'),
        'vendor' => env('SELCOM_VENDOR', 'TILL61067328'),
    ],

    'azampay' => [
        'base_url' => env('AZAMPAY_BASE_URL', 'https://sandbox.azampay.co.tz'),
        'auth_base_url' => env('AZAMPAY_AUTH_BASE_URL', 'https://authenticator-sandbox.azampay.co.tz'),
        'client_id' => env('AZAMPAY_CLIENT_ID'),
        'client_secret' => env('AZAMPAY_CLIENT_SECRET'),
        'app_name' => env('AZAMPAY_APP_NAME'),
        'api_key' => env('AZAMPAY_API_KEY'),
    ],

];
