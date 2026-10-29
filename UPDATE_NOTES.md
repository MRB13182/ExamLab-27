# Update notes

## Included in this branch
- Added an exam schedule card to the setup screen. Schedule title, subject, chapter/unit, and local date/time are stored on this device.
- Requests browser notifications and checks reminders 10 minutes before the scheduled time while the app/browser is running or resumes in the foreground.
- Exam countdown now submits through the same grading route automatically at timeout, and uses the latest draft answers when the timer fires.
- Added a version marker and five-second update banner for users with an existing stored version marker.
- Generation request now applies a bounded output-token budget based on question count to avoid asking the model for excessively long outputs.

## Important platform constraints
- This repository does not contain native Android/Capacitor scheduled-notification integration. A normal web page cannot guarantee an alarm while the browser/WebView is force-stopped or the device is restricting background execution. Reliable closed-app Android reminders require native scheduled notifications / a service with Android notification permission.
- A new update banner requires deployment of this branch with a new `app-version` meta value. It only says an update is available; it does not silently download/install an APK. Android still requires the user to download the APK from the Navbar and confirm installation.
- Faster generation is not guaranteed because Gemini service load, network latency, and quota also affect response times. Output token limits may shorten overly verbose results, so check generated CQ quality.
- Auto-submit final result can still take time if server-side AI CQ grading is enabled; the timeout ends the exam and begins submission, not a guarantee of instantaneous grading.
