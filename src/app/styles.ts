const styles = {
  // ... existing styles ...
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#0A8996',
    color: '#FFFFFF',
    padding: '10px',
    borderRadius: '8px',
    maxWidth: '60%',
    whiteSpace: 'pre-wrap',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  serverBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#0A8996',
    color: '#FFFFFF',
    padding: '10px',
    borderRadius: '8px',
    maxWidth: '60%',
    whiteSpace: 'pre-wrap',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  
  callButton: {
    cursor: 'pointer',
    border: 'none',
    backgroundColor: '#6F49FF',
    color: '#FFFFFF',
    padding: '8px 12px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },

  sendButton: {
    cursor: 'pointer',
    border: 'none',
    backgroundColor: '#6F49FF',
    color: '#FFFFFF',
    width: '40px',
    height: '40px',
    fontSize: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  recordIcon: {
    color: '#FFFFFF',
    fontSize: '20px',
  },

  recordIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    backgroundColor: '#6F49FF',
    color: '#FFFFFF',
  },
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#6F49FF',
    color: '#FFFFFF',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    fontWeight: '500',
  },
  
  // ... rest of the styles ...
} 