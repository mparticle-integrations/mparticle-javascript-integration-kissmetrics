(function (window) {
    var MessageType = {
        SessionStart: 1,
        SessionEnd: 2,
        PageView: 3,
        PageEvent: 4,
        CrashReport: 5,
        OptOut: 6
    },
    isInitialized = false,
    forwarderSettings,
    name = 'KISSmetricsForwarder';

    function getEventTypeName(eventType) {
        switch (eventType) {
            case window.mParticle.EventType.Navigation:
                return 'Navigation';
            case window.mParticle.EventType.Location:
                return 'Location';
            case window.mParticle.EventType.Search:
                return 'Search';
            case window.mParticle.EventType.Transaction:
                return 'Transaction';
            case window.mParticle.EventType.UserContent:
                return 'User Content';
            case window.mParticle.EventType.UserPreference:
                return 'User Preference';
            case window.mParticle.EventType.Social:
                return 'Social';
            default:
                return 'Other';
        }
    }

    function getIdentityTypeName(identityType) {
        switch (identityType) {
            case window.Particle.IdentityType.CustomerId:
                return 'Customer ID';
            case window.mParticle.IdentityType.Facebook:
                return 'Facebook ID';
            case window.mParticle.IdentityType.Twitter:
                return 'Twitter ID';
            case window.mParticle.IdentityType.Google:
                return 'Google ID';
            case window.mParticle.IdentityType.Microsoft:
                return 'Microsoft ID';
            case window.mParticle.IdentityType.Yahoo:
                return 'Yahoo ID';
            case window.mParticle.IdentityType.Email:
                return 'Email';
            case window.mParticle.IdentityType.Alias:
                return 'Alias ID';
            case window.mParticle.IdentityType.FacebookCustomAudienceId:
                return 'Facebook App User ID';
            default:
                return 'Other ID';
        }
    }

    function processEvent(event) {
        if (isInitialized) {
            try {
                if (event.dt == MessageType.PageEvent ||
                    event.dt == MessageType.PageView) {
                    if (event.et == window.mParticle.EventType.Transaction) {
                        logTransaction(event);
                    }
                    else {
                        logEvent(event);
                    }
                }
                return 'Successfully sent to ' + name;
            }
            catch (e) {
                return 'Failed to send to: ' + name + ' ' + e;
            }
        }

        return 'Can\'t send to forwarder ' + name + ', not initialized';
    }

    function setUserAttribute(key, value) {
        if (isInitialized) {
            if (forwarderSettings.includeUserAttributes.toLowerCase() == 'true') {
                try {
                    var attributeDict = {};
                    attributeDict[key] = value;
                    _kmq.push(['set', attributeDict]);
                    return 'Successfully called SET API on ' + name;
                } catch (e) {
                    return 'Failed to call SET API on ' + name + ' ' + e;
                }
            }
        } else {
            return 'Can\'t call setUserAttribute on forwarder ' + name + ', not initialized';
        }
    }

    function setUserIdentity(id, type) {
        if (isInitialized) {
            if (forwarderSettings.useCustomerId.toLowerCase() == 'true' && type == window.mParticle.IdentityType.CustomerId) {
                try {
                    _kmq.push(['identify', id]);
                    return 'Successfull called IDENTITY API on ' + name;
                } catch (e) {
                    return 'Failed to call IDENTITY API on ' + name + ' ' + e;
                }
            } else {
                setUserAttribute(getIdentityTypeName(type), id);
            }
        } else {
            return 'Can\'t call setUserIdentity on forwarder ' + name + ', not initialized';
        }
    }

    function logEvent(data) {

        data.attrs = data.attrs || {};
        data.attrs['MPEventType'] = getEventTypeName(data.et);

        _kmq.push(['record',
            data.n,
            data.attrs]);

    }

    function logTransaction(data) {
        if (data.attrs && data.attrs.$MethodName && data.attrs.$MethodName === 'LogEcommerceTransaction') {
            // User used logTransaction method, set the event name
            data.n = 'Purchased';
        }

        logEvent(data);
    }


    function initForwarder(settings) {
        try {
            forwarderSettings = settings;
            function _kms(u) {
                setTimeout(function () {
                    var d = document, f = d.getElementsByTagName('script')[0],
                    s = d.createElement('script');
                    s.type = 'text/javascript'; s.async = true; s.src = u;
                    f.parentNode.insertBefore(s, f);
                }, 1);
            }

            var protocol = forwarderSettings.useSecure == 'True' ? 'https:' : '';
            _kms(protocol + '//i.kissmetrics.com/i.js');
            _kms(protocol + '//doug1izaerwt3.cloudfront.net/' + forwarderSettings.apiKey + '.1.js');

            isInitialized = true;

            return 'Successfully initialized: ' + name;
        }
        catch (e) {
            return 'Failed to initialize: ' + name;
        }
    }

    if (!window || !window.mParticle || !window.mParticle.addForwarder) {
        return;
    }

    window.mParticle.addForwarder({
        name: name,
        init: initForwarder,
        process: processEvent,
        setUserIdentity: setUserIdentity,
        setUserAttribute: setUserAttribute
    });

})(window);