from gtts import gTTS

import os

text="hello world"

language="en"

myobj = gTTS(text=text,lang=language,slow=False)

myobj.save("welcome.mp3")

os.system("start welcome.mp3")