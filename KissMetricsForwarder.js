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
    name = 'KISSmetricsForwarder',
    reportingService,
    id = null;

    function getEventTypeName(eventType) {
        return mParticle.EventType.getName(eventType);
    }

    function getIdentityTypeName(identityType) {
        return mParticle.IdentityType.getName(identityType);
    }

    function processEvent(event) {
        if (isInitialized) {
            try {
                if (event.EventDataType == MessageType.PageEvent || event.EventDataType == MessageType.PageView) {
                    if (event.EventCategory == window.mParticle.EventType.Transaction) {
                        logTransaction(event);
                    }
                    else {
                        logEvent(event);
                    }

                    if (reportingService) {
                        reportingService(id, event);
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
                }
                catch (e) {
                    return 'Failed to call SET API on ' + name + ' ' + e;
                }
            }
        } else {
            return 'Can\'t call setUserAttribute on forwarder ' + name + ', not initialized';
        }
    }

    function setUserIdentity(id, type) {
        if (isInitialized) {
            if (forwarderSettings.useCustomerId.toLowerCase() == 'true' &&
                type == window.mParticle.IdentityType.CustomerId) {

                try {
                    _kmq.push(['identify', id]);
                    return 'Successfull called IDENTITY API on ' + name;
                }
                catch (e) {
                    return 'Failed to call IDENTITY API on ' + name + ' ' + e;
                }
            }
            else {
                setUserAttribute(getIdentityTypeName(type), id);
            }
        }
        else {
            return 'Can\'t call setUserIdentity on forwarder ' + name + ', not initialized';
        }
    }

    function logEvent(data) {

        data.EventAttributes = data.EventAttributes || {};
        data.EventAttributes['MPEventType'] = getEventTypeName(data.EventCategory);

        _kmq.push(['record',
            data.EventName,
            data.EventAttributes]);

    }

    function logTransaction(data) {
        if (data.EventAttributes &&
            data.EventAttributes.$MethodName &&
            data.EventAttributes.$MethodName === 'LogEcommerceTransaction') {

            // User used logTransaction method, set the event name
            data.EventName = 'Purchased';
        }

        logEvent(data);
    }

    function initForwarder(settings, service, moduleId) {
        forwarderSettings = settings;
        reportingService = service;
        id = moduleId;

        try {
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