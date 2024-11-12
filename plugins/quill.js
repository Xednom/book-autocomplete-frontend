// plugins/quill.js
import Vue from 'vue'
import Quill from 'quill'
import { QuillEditor } from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill-mention'

Vue.component('QuillEditor', QuillEditor)

// Register Quill Mention
const Mention = require('quill-mention').default
Quill.register('modules/mention', Mention)
