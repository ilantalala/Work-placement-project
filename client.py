import requests

def send_data_to_server():
    try:
        url = 'http://127.0.0.1:5000/api/calculate-average'

        schedules = [
            {"day": "Monday", "skill": "Technician", "start_time": "7:00", "end_time": "7:30", "number_of_employ": 10},
            {"day": "Monday", "skill": "Technician", "start_time": "7:30", "end_time": "8:00", "number_of_employ": 15},
            {"day": "Monday", "skill": "Technician", "start_time": "8:00", "end_time": "8:30", "number_of_employ": 8},
            # Add more schedules with intervals until 17:00
            {"day": "Monday", "skill": "Technician", "start_time": "8:30", "end_time": "9:00", "number_of_employ": 12},
            {"day": "Monday", "skill": "Technician", "start_time": "9:00", "end_time": "9:30", "number_of_employ": 14},
            {"day": "Monday", "skill": "Technician", "start_time": "9:30", "end_time": "10:00", "number_of_employ": 10},
            {"day": "Monday", "skill": "Technician", "start_time": "10:00", "end_time": "10:30",
             "number_of_employ": 18},
            {"day": "Monday", "skill": "Technician", "start_time": "10:30", "end_time": "11:00",
             "number_of_employ": 20},
            {"day": "Sunday", "skill": "Technician", "start_time": "7:00", "end_time": "7:30", "number_of_employ": 10},
            {"day": "Sunday", "skill": "Technician", "start_time": "7:30", "end_time": "8:00", "number_of_employ": 15},
            {"day": "Sunday", "skill": "Technician", "start_time": "8:00", "end_time": "8:30", "number_of_employ": 8},
            # Add more schedules with intervals until 17:00
            {"day": "Sunday", "skill": "Technician", "start_time": "8:30", "end_time": "9:00", "number_of_employ": 12},
            {"day": "Sunday", "skill": "Technician", "start_time": "9:00", "end_time": "9:30", "number_of_employ": 14},
            {"day": "Sunday", "skill": "Technician", "start_time": "9:30", "end_time": "10:00", "number_of_employ": 10},
            {"day": "Sunday", "skill": "Technician", "start_time": "10:00", "end_time": "10:30",
             "number_of_employ": 18},
            {"day": "Sunday", "skill": "Technician", "start_time": "10:30", "end_time": "11:00",
             "number_of_employ": 20},
            {"day": "Sunday", "skill": "Technician", "start_time": "11:00", "end_time": "11:30",
             "number_of_employ": 15},
            # Continue adding schedules until 17:00
            {"day": "Sunday", "skill": "Technician", "start_time": "11:30", "end_time": "12:00",
             "number_of_employ": 14},
            {"day": "Sunday", "skill": "Technician", "start_time": "12:00", "end_time": "12:30",
             "number_of_employ": 18},
            {"day": "Sunday", "skill": "Technician", "start_time": "12:30", "end_time": "13:00",
             "number_of_employ": 20},
            {"day": "Sunday", "skill": "Technician", "start_time": "13:00", "end_time": "13:30",
             "number_of_employ": 15},
            {"day": "Sunday", "skill": "Technician", "start_time": "13:30", "end_time": "14:00",
             "number_of_employ": 12},
            {"day": "Sunday", "skill": "Technician", "start_time": "14:00", "end_time": "14:30",
             "number_of_employ": 10},
            {"day": "Sunday", "skill": "Technician", "start_time": "14:30", "end_time": "15:00", "number_of_employ": 8},
            {"day": "Sunday", "skill": "Technician", "start_time": "15:00", "end_time": "15:30",
             "number_of_employ": 15},
            {"day": "Sunday", "skill": "Technician", "start_time": "15:30", "end_time": "16:00",
             "number_of_employ": 18},
            {"day": "Sunday", "skill": "Technician", "start_time": "16:00", "end_time": "16:30",
             "number_of_employ": 20},
            {"day": "Sunday", "skill": "Technician", "start_time": "16:30", "end_time": "17:00",
             "number_of_employ": 15},
            {"day": "Sunday", "skill": "WifiTech", "start_time": "8:30", "end_time": "9:00", "number_of_employ": 12},
            {"day": "Sunday", "skill": "WifiTech", "start_time": "9:00", "end_time": "9:30", "number_of_employ": 14},
            {"day": "Sunday", "skill": "WifiTech", "start_time": "9:30", "end_time": "10:00", "number_of_employ": 10},
            {"day": "Sunday", "skill": "WifiTech", "start_time": "10:00", "end_time": "10:30",
             "number_of_employ": 18},
        ]

        time_ranges = [
            {"day": "Sunday", "skill": "WifiTech", "start_time": "8:30", "end_time": "10:00"},
            {"skill": "Technician", "day": "Sunday", "start_time": "7:00", "end_time": "11:30"},
            {"skill": "Technician", "day": "Sunday", "start_time": "10:00", "end_time": "15:00"},
            {"skill": "Technician", "day": "Sunday", "start_time": "12:00", "end_time": "16:00"},
            {"skill": "Technician", "day": "Sunday", "start_time": "12:00", "end_time": "17:00"},
            {"skill": "Technician", "day": "Monday", "start_time": "7:00", "end_time": "11:30"},
            {"skill": "Technician", "day": "Monday", "start_time": "10:00", "end_time": "13:00"},
            {"skill": "Technician", "day": "Monday", "start_time": "10:00", "end_time": "16:00"},
            {"skill": "Technician", "day": "Monday", "start_time": "13:30", "end_time": "17:00"},
            # Add more time ranges as needed
        ]

        data = {'schedules': schedules, 'employ_data': time_ranges}
        response = requests.post(url, json=data)
        if response.status_code == 200:
            time_ranges_from_server = response.json().get('time_ranges', [])
            print('Time Ranges received from the server:')
            for time_range in time_ranges_from_server:
                print(time_range)

        else:
            print(f'Error! Status Code: {response.status_code}')

    except Exception as e:
      print('Error:', str(e))


if __name__ == '__main__':
        send_data_to_server()

