import React, { Component } from 'react';

interface ChatBotProps {}

interface ChatBotState {}

class ChatBot extends Component<ChatBotProps, ChatBotState> {
    constructor(props: ChatBotProps) {
        super(props);
    }

    componentDidMount() {
        (function (d, m) {
            const kommunicateSettings = {
                appId: "74d425b2f98d8709822589a152ae5aeb",
                popupWidget: true,
                automaticChatOpenOnNavigation: true,
            };
            const s = document.createElement("script");
            s.type = "text/javascript";
            s.async = true;
            s.src = "https://widget.kommunicate.io/v2/kommunicate.app";
            const h = document.getElementsByTagName("head")[0];
            h.appendChild(s);
            (window as any).kommunicate = m;
            m._globals = kommunicateSettings;
        })(document, (window as any).kommunicate || {});
    }

    render() {
        return <div></div>;
    }
}

export default ChatBot;
