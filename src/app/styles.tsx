// ------------------ Styles ------------------
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    maxWidth: '600px',
    margin: '0 auto',
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
    filter: 'brightness(0) invert(1)', // Make emoji white
    userSelect: 'none', // Prevent text selection
    WebkitUserSelect: 'none', // For Safari
    MozUserSelect: 'none', // For Firefox
  },
  clearButton: {
    margin: '5px 10px',
    padding: '5px 10px',
    border: '1px solid var(--border-color)',
    backgroundColor: '#f0f0f0',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  chatArea: {
    flex: 1,
    padding: '10px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    backgroundColor: '#fafafa',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    color: '#000000',
    padding: '10px',
    borderRadius: '8px',
    maxWidth: '60%',
    whiteSpace: 'pre-wrap',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    marginBottom: '4px',
  },
  serverBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    color: '#000000',
    padding: '10px',
    borderRadius: '8px',
    maxWidth: '60%',
    whiteSpace: 'pre-wrap',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    marginBottom: '4px',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    borderTop: '1px solid #ccc',
    padding: '10px',
    background: '#f5f5f5',
  },
  input: {
    flex: 1,
    padding: '8px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginRight: '10px',
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
    userSelect: 'none', // Prevent text selection
    WebkitUserSelect: 'none', // For Safari
    MozUserSelect: 'none', // For Firefox
  },
  recordIcon: {
    color: '#FFFFFF',
    fontSize: '20px',
  },
}

export default styles;
