import React from 'react'

export default function ConnectionBadge({ connected }){
  return (
    <div className={`conn ${connected? 'online': 'offline'}`}>{connected? 'Online' : 'Offline'}</div>
  )
}