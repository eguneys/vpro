import './index.css'
import './pro.css'
import './bcolors.css'
import '../assets/ovim.css'
import '../assets/vchessboard.css'
import '../assets/vchessreplay.css'

import { render } from 'solid-js/web'

import App from './view'

export default function VPro(element: HTMLElement) {
  render(App, element)
}
