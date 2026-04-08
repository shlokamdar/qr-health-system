import { useState, useCallback, useRef } from 'react';
import api from '../utils/api';

/**
 * Custom hook for real-time field validation.
 * @param {Object} rules - Map of field names to validation functions or regex.
 * @param {Array} asyncFields - Fields that require backend duplicate checks.
 */
export const useFieldValidation = (rules = {}, asyncFields = []) => {
    const [errors, setErrors] = useState({});
    const [valid, setValid] = useState({});
    const [isValidating, setIsValidating] = useState({});

    // Keep track of pending API calls to avoid race conditions
    const pendingChecks = useRef({});

    // Native debounce implementation
    const debounce = (func, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func(...args), delay);
        };
    };

    const validateField = useCallback(async (name, value, allData = {}) => {
        let fieldError = '';

        // 1. Basic synchronous validation
        if (rules[name]) {
            fieldError = rules[name](value, allData);
        }

        // 2. Special cases like password match
        if (name === 'confirmPassword' && value !== allData.password) {
            fieldError = 'Passwords do not match';
        }

        // 3. Update local state for sync errors
        if (fieldError) {
            setErrors(prev => ({ ...prev, [name]: fieldError }));
            setValid(prev => ({ ...prev, [name]: false }));
            return;
        }

        // 4. Async duplicate checks (only if sync validation passed)
        if (asyncFields.includes(name) && value) {
            setIsValidating(prev => ({ ...prev, [name]: true }));

            // Debounced API check
            checkAvailability(name, value);
        } else if (value) {
            // If no async check needed and sync passed
            setErrors(prev => ({ ...prev, [name]: '' }));
            setValid(prev => ({ ...prev, [name]: true }));
        } else {
            // Reset if empty
            setErrors(prev => ({ ...prev, [name]: '' }));
            setValid(prev => ({ ...prev, [name]: false }));
        }
    }, [rules, asyncFields]);

    const checkAvailability = useCallback(
        debounce(async (name, value) => {
            try {
                let endpoint = '';
                let params = {};

                if (name === 'username') {
                    endpoint = 'auth/check-username/';
                    params = { username: value };
                } else if (name === 'email') {
                    endpoint = 'auth/check-email/';
                    params = { email: value };
                } else if (name === 'contact_number' || name === 'phone') {
                    endpoint = 'auth/check-phone/';
                    params = { phone: value };
                }

                if (!endpoint) return;

                const response = await api.get(endpoint, { params });

                if (response.data.available) {
                    setErrors(prev => ({ ...prev, [name]: '' }));
                    setValid(prev => ({ ...prev, [name]: true }));
                } else {
                    const messages = {
                        username: 'This username is already taken',
                        email: 'This email is already registered',
                        contact_number: 'This phone number is already registered',
                        phone: 'This phone number is already registered'
                    };
                    setErrors(prev => ({ ...prev, [name]: messages[name] }));
                    setValid(prev => ({ ...prev, [name]: false }));
                }
            } catch (err) {
                console.error(`Error checking ${name} availability:`, err);
            } finally {
                setIsValidating(prev => ({ ...prev, [name]: false }));
            }
        }, 500),
        []
    );

    const formIsValid = (requiredFields) => {
        return requiredFields.every(field => valid[field] === true) &&
            Object.values(errors).every(err => !err);
    };

    return { errors, valid, isValidating, validateField, formIsValid, setValid, setErrors };
};
