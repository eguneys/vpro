import './index.css'
import './pro.css'
import '../assets/ovim.css'
import '../assets/vchessboard.css'

import { render } from 'solid-js/web'

import App from './view'

export default function VPro(element: HTMLElement) {
  render(App, element)
}
