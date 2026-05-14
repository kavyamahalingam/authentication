const API_BASE = '/api/auth/activity';

const trackActivity = async (actionType, description = '', pageUrl = window.location.pathname, category = 'General') => {
    try {
        const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrf_access_token='))?.split('=')[1];
        await fetch(API_BASE, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({
                action_type: actionType,
                description,
                page_url: pageUrl,
                category: category
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
    custom: (type, desc, category = 'General') => trackActivity(type, desc, window.location.pathname, category)
};
