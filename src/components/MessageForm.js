import React, { Component } from 'react';
import Message from './Message';
import firebase from 'firebase';

export default class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allFetched: false,
      isLoading: false,
      list: [],
      message: '',
      referenceToOldestKey: null,
      scrollPosition: '',
      userName: '',
    };
    this.messageRef = firebase.database().ref().child('messages');
  }

  componentDidMount() {
    this.listenMessages();
    this.scrollToBottom();
    // this.isScroll.addEventListener("scroll", () => {
    //     if (this.isScroll.scrollTop === 0 && !this.state.isLoading) {
    //         if (!this.state.allFetched) {
    //             this.setState({ isLoading: true })
    //             setTimeout(() => {
    //             this.loadMoreItems();
    //             }, 800);
    //         }
    //     }
    //   });
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.user) {
      this.setState({ userName: nextProps.user.displayName});
    } else {
        this.setState({ userName: '' });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.list.length === 0 && this.state.list.length > 0) {
      this.scrollToBottom();
    }
    if (prevState.list.length !== 0 && prevState.list.length !== this.state.list.length) {
      const postsAdded = this.state.list.length - prevState.list.length;
    //   this.isScroll.scrollTo({
    //     top: 40 * postsAdded,
    //     behavior: "instant"
    //   });
      this.scrollToBottom();
    }
  }

  componentWillUnmount() {
      this.isScroll.removeEventListener();
  }

  handleChange = (event) => {
    this.setState({ message: event.target.value });
  }

  handleSend = () => {
    this.scrollToBottom();
    if (this.state.message) {
      var newItem = {
        userName: this.state.userName,
        message: this.state.message,
      }
      this.messageRef.push(newItem);
      this.setState({ message: '' });
      this.scrollToBottom();
    }
  }

  handleKeyPress = (event) => {
    if (event.key !== 'Enter') return;
    this.handleSend();
  }

  listenMessages = () => {
    if (!this.state.referenceToOldestKey) {
        this.messageRef
        .orderByKey()
        .limitToLast(400)
        .on('value', message => {
            if (message.val()) {
                console.log(this.state.list.length);
                const messageKeys = Object.keys(message.val()).sort().reverse();
                this.setState({
                list: Object.values(message.val()),
                referenceToOldestKey: messageKeys[messageKeys.length - 1]
                });
            }
        });
     }
  }

//   loadMoreItems = () => {
//     this.messageRef
//         .orderByKey()
//         .endAt(this.state.referenceToOldestKey)
//         .limitToLast(20)
//         .once('value')
//         .then(message => {
//             console.log('ruh roh')
//             const messageList = Object.values(message.val());
//             const messageKeys = Object.keys(message.val()).sort().reverse();
//             const oldestKey = messageKeys[messageKeys.length - 1];
//             const allFetched = this.state.referenceToOldestKey === oldestKey;
//             this.setState({
//                 allFetched,
//                 isLoading: false,
//                 list: [...messageList, ...this.state.list],
//                 referenceToOldestKey: oldestKey,
//             });
//     })
//   }

  scrollToBottom = () => {
    console.log('scrollToBottom')
    this.messagesEnd.scrollIntoView({ behavior: "instant" });
  }
  
  render() {
    return (
      <div className="form">
        <div className="form__message" ref={el => { this.isScroll = el; }}>
          <div style={{ float:"left", clear: "both" }}
             ref={(el) => { this.messagesStart = el; }}>
          </div>
          { this.state.list.map((item, index) =>
            <Message key={index} message={item} />
          )}
          <div style={{ float:"left", clear: "both" }}
             ref={(el) => { this.messagesEnd = el; }}>
          </div>
        </div>
        { this.state.userName && <div className="form__row">
          <input
            className="form__input"
            type="text"
            placeholder="Type message"
            value={this.state.message}
            onChange={this.handleChange}
            onKeyPress={this.handleKeyPress}
          />
          <button
            className="form__button"
            onClick={this.handleSend}
          >
            {this.state.isLoading
              ? <div id="loading"></div>
              : <p>send</p>
            }
          </button>
        </div> }
      </div>
    );
  }
}