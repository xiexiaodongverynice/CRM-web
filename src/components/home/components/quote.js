import React from 'react'
import PropTypes from 'prop-types'
import styles from './quote.less'

function Quote ({ name, content, title, avatar }) {
  return (
    <div className={styles.quote}>
      <div className={styles.inner}>
        {title}
      </div>
      <div className={styles.content}>
        <div className={styles.description}>
          <p>{content}</p>
        </div>
        <div className={styles.footer}>
          <div className={styles.description}>
            <p>-{name}-</p>
          </div>
          <div className={styles.avatar} style={{ backgroundImage: `url(${avatar})` }} />
        </div>

      </div>
    </div>
  )
}

Quote.propTypes = {
  name: PropTypes.string,
  content: PropTypes.string,
  title: PropTypes.string,
  avatar: PropTypes.string,
}

export default Quote
