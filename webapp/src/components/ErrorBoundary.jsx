import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError() {
        return {hasError: true};
    }

    componentDidCatch(error, info) {
        console.error('UI error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return <div>Une erreur est survenue.</div>;
        }
        return this.props.children;
    }
}
