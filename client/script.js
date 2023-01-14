import bot from "./assets/bot.svg";
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval

// when processing or loading the answer to the question asked
function loader(element) {
  element.textContent = ''

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === "....") {
      element.textContent = '';
    }
  }, 300);
}

// when AI is typing the answers
function typeText(element, text) {
  let index = 0

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index)
      index++
    } else {
      clearInterval(interval)
    }
  }, 20)
}

// to generate unique id for each text input (questions)
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

// to display the icons for ai and user and also to display the message
function chatStripe(isAI, value, uniqueId) {
  return (
    `
        <div class="wrapper ${isAI && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAI ? bot : user} 
                      alt="${isAI ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
  )
}

// handle submit function to triger the AI generated response
const handleSubmit = async (e) => {
  e.preventDefault()

  const data = new FormData(form)

  // generate user's chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))
  form.reset()

  // generate bot's chat stripe
  const uniqueId = generateUniqueId()
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId)

  loader(messageDiv)

  // fetch data from server -> bot's response
  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  // as we are no longer loading 
  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parseData = data.bot.trim();

    typeText(messageDiv, parseData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong, Please try again";

    alert(err);
  }
}



// check if submitted
form.addEventListener('submit', handleSubmit)

// check if enter key is used to submit and handle the event accordingly
// 13 is the key for Enter key in the keyboard
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e)
  }
})