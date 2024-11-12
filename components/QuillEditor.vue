<template>
    <div ref="editor"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, defineProps, defineEmits } from 'vue';
import Quill from 'quill';
import 'quill/dist/quill.snow.css'; // Import Quill styles
import 'quill-mention/dist/quill.mention.css'; // Import mention styles
import 'quill-mention/autoregister'; // Automatically register quill-mention

// Define props and emits for v-model compatibility
const props = defineProps<{ modelValue: string }>();
const emit = defineEmits(['update:modelValue']);

// Reference to the editor element
const editor = ref<HTMLDivElement | null>(null);
let quill: Quill | null = null;

// Debounce function to limit API calls
const debounce = (func: Function, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

// Initialize Quill editor on mount
onMounted(() => {
    if (editor.value) {
        quill = new Quill(editor.value, {
            theme: 'snow',
            modules: {
                toolbar: false,
                mention: {
                    allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
                    mentionDenotationChars: ['@', '#'],
                    positioningStrategy: "fixed",
                    source: debounce(searchBooks, 300), // Debounce searchBooks with 300ms delay
                    renderLoading: () => {
                        return 'Loading...';
                    }
                }
            },
            placeholder: 'Type something and mention @ or #...'
        });

        // Set initial value of editor based on modelValue prop
        quill.root.innerText = props.modelValue;

        // Listen to text-change events and emit updated content
        quill.on('text-change', () => {
            const content = quill!.root.innerText;
            emit('update:modelValue', content);
        });
    }
});

// Watch for changes in modelValue prop to update Quill editor content
watch(
    () => props.modelValue,
    (newValue) => {
        if (quill && quill.root.innerText !== newValue) {
            quill.root.innerText = newValue;
        }
    }
);

// Function to search for books using Open Library API
const searchBooks = async (searchTerm: string, renderList: (matches: any[]) => void, mentionChar: string) => {
    const query = searchTerm.trim();

    if (!query.length) {
        renderList([]); // No input, return empty list
        return;
    }

    try {
        console.info('query: ', encodeURIComponent(query));
        const response = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(query)}`);
        if (response.ok) {
            const data = await response.json();
            const matches = [];

            // Use forEach to populate matches
            data.docs.forEach((book: any) => {
                if (book.title) {
                    // Ensure that the title exists
                    matches.push({
                        id: book.key,
                        value: book.title || 'Unknown Title',
                        author: book.author_name ? book.author_name.join(', ') : 'Unknown Author',
                        year: book.first_publish_year || 'Unknown Year'
                    });
                }
            });

            console.info('matches:', matches); // Log matches for debugging

            // Render the list of matches as suggestions
            renderList(matches);
        } else {
            console.error('Error fetching books:', response.statusText);
            renderList([]); // Return empty list on error
        }
    } catch (error) {
        console.error('Error fetching books:', error);
        renderList([]); // Return empty list on error
    }
};
</script>

<style scoped>
.quill-editor {
    height: 300px; /* Adjust height as needed */
}

.ql-mention-list {
    position: absolute; /* Ensure it is positioned absolutely */
    z-index: 1000; /* Ensure it appears above other elements */
}
</style>
