const API_BASE = '/api/auth/activity';

const trackActivity = async (actionType, description = '', pageUrl = window.location.pathname) => {
    try {
        await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action_type: actionType,
                description,
                page_url: pageUrl
            })
        });
    } catch (err) {
        console.error('Failed to log activity:', err);
    }
};

export const tracker = {
    pageView: (pageName) => trackActivity('page_view', `Visited ${pageName}`, pageName),
    click: (elementName) => trackActivity('click', `Clicked ${elementName}`),
    formSubmit: (formName) => trackActivity('form_submit', `Submitted ${formName}`),
    custom: (type, desc) => trackActivity(type, desc)
};
