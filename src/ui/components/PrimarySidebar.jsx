import React, {useState} from "react"
import GroupIcon from "./GroupIcon.jsx";
import NotesIcon from "./NotesIcon.jsx";
import QuizIcon from "./QuizIcon.jsx";
import {NavLink} from 'react-router-dom'

export default function PrimarySidebar({activeView, onNavigate}) {
  const navItems = [
    {label: 'Notes', path: '/notes', svg: <NotesIcon />},
    {label: 'Groups', path: '/groups', svg: <GroupIcon />},
    {label: 'Quizzes', path: '/quizzes', svg: <QuizIcon />},
  ]

  return (
    <div className="primary-sidebar">
      <div className="top-primary-sidebar">
        <ul className="main-app-navigation">
          {navItems.map(navItem => (
            <li key={navItem.label.toLowerCase()}>
              <NavLink
                to={navItem.path}
                style={({isActive}) => ({
                  textDecoration: 'none',
                  color: isActive ? 'black' : 'white',
                })}
                aria-label={navItem.label}
              >
                {/*<img src={navItem.svg} alt={navItem.label} />*/}
                {/*<GroupIcon/>*/}
                {navItem.svg}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}