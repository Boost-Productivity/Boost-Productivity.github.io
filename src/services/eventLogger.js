import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const EVENT = {
    SESSION: {
        START: 'session_start',
        END: 'session_end'
    },
    PAGE: {
        HOME: 'home_page_view',
        ACCOUNT: 'account_page_view'
    },
    MODAL: {
        LOGIN_VIEW: 'login_modal_view',
        SIGNUP_VIEW: 'signup_modal_view'
    },
    AUTH: {
        LOGIN_ATTEMPT: 'login_attempt',
        LOGIN_SUCCESS: 'login_success',
        SIGNUP_ATTEMPT: 'signup_attempt',
        SIGNUP_SUCCESS: 'signup_success'
    },
    NODE: {
        SUBMIT: 'node_submitted',
        DELETE: 'node_deleted',
        MOVE: 'node_moved'
    },
    ACCOUNT: {
        EMAIL_UPDATE_CLICK: 'update_email_clicked',
        EMAIL_UPDATE_SUCCESS: 'update_email_success',
        PASSWORD_UPDATE_CLICK: 'update_password_clicked',
        PASSWORD_UPDATE_SUCCESS: 'update_password_success',
        NAME_UPDATE_CLICK: 'update_display_name_clicked',
        NAME_UPDATE_SUCCESS: 'update_display_name_success',
        RESET_EMAIL_CLICK: 'send_password_reset_email_clicked',
        RESET_EMAIL_SUCCESS: 'send_password_reset_email_success',
        DANGER_ZONE_VIEW: 'danger_zone_view',
        LOGOUT_CLICK: 'logout_clicked',
        LOGOUT_SUCCESS: 'logout_success',
        DELETE_ACCOUNT_CLICK: 'delete_account_clicked',
        DELETE_ACCOUNT_CONFIRM: 'delete_account_confirm',
        DELETE_ACCOUNT_SUCCESS: 'delete_account_success'
    }
};

const logEvent = async (eventType, userId = 'anonymous', data = {}) => {
    try {
        await addDoc(collection(db, 'events'), {
            type: eventType,
            userId,
            timestamp: new Date(),
            sessionId: sessionStorage.getItem('sessionId') || 'unknown',
            data
        });
    } catch (error) {
        console.error('Error logging event:', error);
    }
};

// Initialize session and generate sessionId
export const initSession = (userId = 'anonymous') => {
    const sessionId = crypto.randomUUID();
    sessionStorage.setItem('sessionId', sessionId);
    logEvent(EVENT.SESSION.START, userId, { sessionId });
};

export { logEvent, EVENT }; 