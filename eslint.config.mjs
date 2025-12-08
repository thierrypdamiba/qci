/**
 * ESLint Configuration
 *
 * Following Qdrant SDK conventions with strict TypeScript rules.
 */

import {defineConfig, globalIgnores} from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,

    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
        // Additional ignores
        'node_modules/**',
        'scripts/**',
    ]),

    // Custom rules following Qdrant conventions
    {
        rules: {
            // Enforce consistent code style
            'object-shorthand': 'warn',
            'arrow-body-style': 'warn',

            // Unused variables (allow underscore prefix)
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                },
            ],

            // Allow both interfaces and types
            '@typescript-eslint/consistent-type-definitions': 'off',

            // Prefer explicit return types on functions
            '@typescript-eslint/explicit-function-return-type': 'off',

            // Allow any for gradual migration (warn instead of error)
            '@typescript-eslint/no-explicit-any': 'warn',

            // React specific
            'react/prop-types': 'off',
            'react/react-in-jsx-scope': 'off',

            // Import organization
            'import/order': 'off',

            // Allow console for debugging (warn in production)
            'no-console': ['warn', {allow: ['warn', 'error']}],
        },
    },
]);

export default eslintConfig;
