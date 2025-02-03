import json
from datetime import datetime, timedelta

# Function to convert milliseconds to timedelta
def milliseconds_to_timedelta(milliseconds):
    return timedelta(milliseconds=int(milliseconds))

# Function to convert timedelta to ASS time format (H:MM:SS.CS)
def timedelta_to_ass_time(td):
    total_seconds = int(td.total_seconds())
    hours, remainder = divmod(total_seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    centiseconds = int(td.microseconds / 10000)
    return f"{hours}:{minutes:02d}:{seconds:02d}.{centiseconds:02d}"

def generate_ass_from_ndjson(ndjson_file, output_ass, video_start, video_end):
    with open(ndjson_file, 'r') as f:
        chat_data = [json.loads(line) for line in f]
    # Define a minimum interval between dialogues (in seconds)
    min_interval = timedelta(seconds=1)

    # Generate dialogue lines
    start_y = 576
    end_y = 0
    duration = 5  # Duration of each message in seconds

    with open(output_ass, 'w') as f:
        # Write ASS header
        f.write("[Script Info]\nTitle: Vertical Scrolling Chat Overlay\nScriptType: v4.00+\n")
        play_res_x = 1280
        play_res_y = 720
        f.write(f"PlayResX: {play_res_x}\n")
        f.write(f"PlayResY: {play_res_y}\n")
        f.write("WrapStyle: 0\n")
        f.write("\n")
        f.write("[V4+ Styles]\n")
        f.write("Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n")
        f.write("Style: Default,Arial,36,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,2,0,1,10,900,10,1\n\n")
        f.write("[Events]\n")
        f.write("Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n")

        last_start_time = -min_interval
        # Generate dialogue lines
        for chat in chat_data:
            reply_chat_item_action = chat.get("replayChatItemAction", {})
            chat_offset_ms = reply_chat_item_action.get("videoOffsetTimeMsec", "0")
            chat_offset_to_video = milliseconds_to_timedelta(chat_offset_ms)

            # process only chat items within video start and end
            if chat_offset_to_video < video_start or chat_offset_to_video > video_end:
                continue

            print(f"Chat offset to video: {chat_offset_to_video}")
            actions = reply_chat_item_action.get("actions", [])
            action = actions[0]
            add_chat_item_action = action.get("addChatItemAction", {})
            item = add_chat_item_action.get("item", {})
            live_chat_text_message_renderer = item.get("liveChatTextMessageRenderer", {})
            # Get author and message if liveChatTextMessageRenderer exists
            if not live_chat_text_message_renderer:
                continue
            author_name = live_chat_text_message_renderer.get("authorName", {}).get("simpleText", "")
            message_runs = live_chat_text_message_renderer.get("message", {}).get("runs", [])
            message = "".join(run.get("text", "") for run in message_runs)
            # skip empty messages, such as emoji-only messages
            if not message:
                continue

            text = f"[{author_name}]: {message}"

            # Calculate timing
            start_time = chat_offset_to_video - video_start
            # Ensure minimum interval between dialogues
            if start_time < last_start_time + min_interval:
                start_time = last_start_time + min_interval
            end_time = start_time + timedelta(seconds=duration)
            last_start_time = start_time

            # Write ASS dialogue line
            f.write(f"Dialogue: 0,{timedelta_to_ass_time(start_time)},{timedelta_to_ass_time(end_time)},Default,,0,0,0,,{{\\move(20,{start_y},20,{end_y})}} {text}\n")

def parse_time_to_timedelta(time_str):
    time_parts = list(map(int, time_str.split(':')))
    return timedelta(hours=time_parts[0] if len(time_parts) == 3 else 0,
             minutes=time_parts[-2],
             seconds=time_parts[-1])

if __name__ == "__main__":
  # accept live_chat file path, start time and end time as arguments
  import sys
  live_chat_file = sys.argv[1]
  output_ass = sys.argv[2]
  start_time = parse_time_to_timedelta(sys.argv[3])
  end_time = parse_time_to_timedelta(sys.argv[4])
  generate_ass_from_ndjson(live_chat_file, output_ass, start_time, end_time)

