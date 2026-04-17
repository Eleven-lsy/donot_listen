/*
 * Provides lightweight client-side stores shared across controllers.
 */

/**
 * Implements a minimal observable store used by frontend state containers.
 */
class Store {
    constructor(initialState = {}) {
        this.state = initialState;
        this.listeners = new Map();
        this.middlewares = [];
    }

    getState() {
        return { ...this.state };
    }

    setState(newState, actionType = 'UPDATE') {
        const prevState = this.state;
        this.state = { ...this.state, ...newState };
        
        this.middlewares.forEach(middleware => {
            middleware(prevState, this.state, actionType);
        });
        
        this.notifyListeners(prevState, this.state);
    }

    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);

        return () => {
            this.listeners.get(key).delete(callback);
        };
    }

    notifyListeners(prevState, newState) {
        this.listeners.forEach((callbacks, key) => {
            if (key === '*' || prevState[key] !== newState[key]) {
                callbacks.forEach(callback => {
                    try {
                        callback(newState[key], prevState[key], newState);
                    } catch (error) {
                        console.error(`Error in listener for ${key}:`, error);
                    }
                });
            }
        });
    }

    useMiddleware(middleware) {
        this.middlewares.push(middleware);
    }

    reset() {
        this.state = {};
        this.notifyListeners({}, {});
    }
}

/**
 * Tracks player-specific state such as transcript, playback, and feedback.
 */
class ListeningStore extends Store {
    constructor() {
        super({
            currentListening: null,
            transcript: [],
            playing: false,
            currentLine: 0,
            feedback: {},
            loading: false,
            error: null
        });
    }

    setCurrentListening(listening) {
        this.setState({ currentListening: listening }, 'SET_LISTENING');
    }

    setTranscript(lines) {
        this.setState({ transcript: lines }, 'SET_TRANSCRIPT');
    }

    setPlaying(playing) {
        this.setState({ playing }, 'SET_PLAYING');
    }

    setCurrentLine(line) {
        this.setState({ currentLine: line }, 'SET_CURRENT_LINE');
    }

    setFeedback(lineNumber, status) {
        const feedback = { ...this.state.feedback, [lineNumber]: status };
        this.setState({ feedback }, 'SET_FEEDBACK');
    }

    setLoading(loading) {
        this.setState({ loading }, 'SET_LOADING');
    }

    setError(error) {
        this.setState({ error }, 'SET_ERROR');
    }

    getFeedback(lineNumber) {
        return this.state.feedback[lineNumber];
    }
}

/**
 * Tracks user-facing state such as profile, collections, and records.
 */
class UserStore extends Store {
    constructor() {
        super({
            profile: null,
            statistics: null,
            collections: [],
            learningRecords: [],
            loading: false,
            error: null
        });
    }

    setProfile(profile) {
        this.setState({ profile }, 'SET_PROFILE');
    }

    setStatistics(statistics) {
        this.setState({ statistics }, 'SET_STATISTICS');
    }

    setCollections(collections) {
        this.setState({ collections }, 'SET_COLLECTIONS');
    }

    addCollection(collection) {
        const collections = [...this.state.collections, collection];
        this.setState({ collections }, 'ADD_COLLECTION');
    }

    removeCollection(listeningId) {
        const collections = this.state.collections.filter(c => c.listeningId !== listeningId);
        this.setState({ collections }, 'REMOVE_COLLECTION');
    }

    setLearningRecords(records) {
        this.setState({ learningRecords: records }, 'SET_LEARNING_RECORDS');
    }

    setLoading(loading) {
        this.setState({ loading }, 'SET_LOADING');
    }

    setError(error) {
        this.setState({ error }, 'SET_ERROR');
    }
}

const listeningStore = new ListeningStore();
const userStore = new UserStore();

listeningStore.useMiddleware((prev, next, action) => {
    if (action === 'SET_PLAYING' && next.playing) {
        console.log('Audio playback started');
    }
});

userStore.useMiddleware((prev, next, action) => {
    if (prev.profile !== next.profile && next.profile) {
        console.log('User profile loaded:', next.profile.username);
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Store, ListeningStore, UserStore, listeningStore, userStore };
}
