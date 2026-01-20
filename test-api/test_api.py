# -*- coding: utf-8 -*-
import requests
import json

BASE_URL = "http://localhost:5000"
TOKEN = "Bearer mock-jwt-token"

headers = {
    "Authorization": TOKEN,
    "Content-Type": "application/json"
}

# Users data from thermal-power-sample-data.md
users = [
    {"userId": "1004889", "name": "胡德剑", "systemRole": "Member", "officeLocation": "成都", "title": "正高级主任工程师", "education": "本科", "status": "Active", "password": "123456"},
    {"userId": "1005184", "name": "官永胜", "systemRole": "Member", "officeLocation": "成都", "title": "主任工程师", "status": "Active", "password": "123456"},
    {"userId": "1006279", "name": "李朝科", "systemRole": "Member", "officeLocation": "成都", "title": "主任工程师", "status": "Active", "password": "123456"},
    {"userId": "1007204", "name": "王建立", "systemRole": "Member", "officeLocation": "成都", "title": "副主任工程师", "status": "Active", "password": "123456"},
    {"userId": "1007241", "name": "张玮", "systemRole": "Member", "officeLocation": "德阳", "title": "高级工程师", "status": "Active", "password": "123456"},
    {"userId": "1007465", "name": "王黔", "systemRole": "Member", "officeLocation": "德阳", "title": "副主任工程师", "status": "Active", "password": "123456"},
    {"userId": "1007690", "name": "金媛媛", "systemRole": "Member", "officeLocation": "成都", "title": "副主任工程师", "status": "Active", "password": "123456"},
    {"userId": "1008072", "name": "卢永尧", "systemRole": "Member", "officeLocation": "成都", "title": "副主任工程师", "status": "Active", "password": "123456"},
    {"userId": "1008344", "name": "陈增芬", "systemRole": "Member", "officeLocation": "成都", "title": "高级工程师", "status": "Active", "password": "123456"},
    {"userId": "1008513", "name": "孙青", "systemRole": "Member", "officeLocation": "德阳", "title": "高级工程师", "status": "Active", "password": "123456"},
    {"userId": "3001226", "name": "李又超", "systemRole": "Leader", "officeLocation": "成都", "title": "副主任工程师", "status": "Active", "password": "123456"},
    {"userId": "3002681", "name": "杨迪", "systemRole": "Member", "officeLocation": "德阳", "title": "高级工程师", "status": "Active", "password": "123456"},
    {"userId": "3002684", "name": "古曦", "systemRole": "Leader", "officeLocation": "德阳", "title": "高级工程师", "status": "Active", "password": "123456"},
    {"userId": "3002865", "name": "钟德富", "systemRole": "Leader", "officeLocation": "德阳", "title": "高级工程师", "status": "Active", "password": "123456"},
    {"userId": "3003407", "name": "廖亨友", "systemRole": "Member", "officeLocation": "成都", "title": "高级工程师", "status": "Active", "password": "123456"},
    {"userId": "3004412", "name": "蒋群雄", "systemRole": "Member", "officeLocation": "德阳", "title": "高级工程师", "status": "Active", "password": "123456"},
    {"userId": "3005901", "name": "王雅雯", "systemRole": "Member", "officeLocation": "成都", "title": "工程师", "status": "Active", "password": "123456"},
    {"userId": "3005905", "name": "曹驰健", "systemRole": "Member", "officeLocation": "德阳", "title": "工程师", "status": "Active", "password": "123456"},
    {"userId": "3005922", "name": "王鸿", "systemRole": "Leader", "officeLocation": "成都", "title": "工程师", "status": "Active", "password": "123456"},
    {"userId": "3005925", "name": "杨巍", "systemRole": "Leader", "officeLocation": "成都", "title": "工程师", "status": "Active", "password": "123456"},
    {"userId": "3006612", "name": "黄鑫", "systemRole": "Member", "officeLocation": "德阳", "title": "工程师", "status": "Active", "password": "123456"},
    {"userId": "3007213", "name": "王可欣", "systemRole": "Member", "officeLocation": "德阳", "title": "工程师", "status": "Active", "password": "123456"},
    {"userId": "3007227", "name": "苏文博", "systemRole": "Member", "officeLocation": "成都", "title": "工程师", "status": "Active", "password": "123456"},
    {"userId": "3008172", "name": "樊嘉豪", "systemRole": "Member", "officeLocation": "成都", "title": "工程师", "status": "Active", "password": "123456"},
    {"userId": "3008231", "name": "李典", "systemRole": "Member", "officeLocation": "成都", "title": "工程师", "status": "Active", "password": "123456"},
    {"userId": "3009101", "name": "刘林涵", "systemRole": "Member", "officeLocation": "成都", "title": "助理工程师", "status": "Active", "password": "123456"},
    {"userId": "3010363", "name": "刘咏芳", "systemRole": "Member", "officeLocation": "成都", "title": "助理工程师", "status": "Active", "password": "123456"},
    {"userId": "3010758", "name": "魏宇航", "systemRole": "Member", "officeLocation": "成都", "title": "助理工程师", "status": "Active", "password": "123456"},
    {"userId": "3010862", "name": "贺向东", "systemRole": "Member", "officeLocation": "成都", "title": "助理工程师", "status": "Active", "password": "123456"},
    {"userId": "3012527", "name": "杨飞越", "systemRole": "Member", "officeLocation": "成都", "title": "助理工程师", "status": "Active", "password": "123456"},
    {"userId": "3012524", "name": "徐青青", "systemRole": "Member", "officeLocation": "成都", "title": "助理工程师", "status": "Active", "password": "123456"},
    {"userId": "3012478", "name": "牟星宇", "systemRole": "Member", "officeLocation": "成都", "title": "助理工程师", "status": "Active", "password": "123456"},
    {"userId": "3012451", "name": "郑典涛", "systemRole": "Member", "officeLocation": "成都", "title": "助理工程师", "status": "Active", "password": "123456"},
    {"userId": "3012535", "name": "盛晋银", "systemRole": "Member", "officeLocation": "成都", "title": "助理工程师", "status": "Active", "password": "123456"},
    {"userId": "3014242", "name": "罗欢", "systemRole": "Member", "officeLocation": "成都", "title": "助理工程师", "status": "Active", "password": "123456"},
    {"userId": "3014388", "name": "郑淇文", "systemRole": "Member", "officeLocation": "成都", "title": "助理工程师", "status": "Active", "password": "123456"},
    {"userId": "3014531", "name": "杨攀", "systemRole": "Member", "officeLocation": "成都", "title": "助理工程师", "status": "Active", "password": "123456"},
    {"userId": "3014253", "name": "黄泽奇", "systemRole": "Member", "officeLocation": "成都", "title": "助理工程师", "status": "Active", "password": "123456"},
    {"userId": "3014229", "name": "曾一涛", "systemRole": "Member", "officeLocation": "成都", "title": "助理工程师", "status": "Active", "password": "123456"},
]

def create_users():
    print("=" * 50)
    print("Creating Users")
    print("=" * 50)
    success, failed = 0, 0
    for user in users:
        try:
            r = requests.post(f"{BASE_URL}/api/users", headers=headers, json=user, timeout=10)
            if r.status_code in [200, 201]:
                print(f"[OK] [{user['userId']}] {user['name']}")
                success += 1
            else:
                print(f"[FAIL] [{user['userId']}] {user['name']} - {r.status_code}: {r.text[:100]}")
                failed += 1
        except Exception as e:
            print(f"[ERROR] [{user['userId']}] {user['name']} - {e}")
            failed += 1
    print(f"\nSummary: Success={success}, Failed={failed}")
    return success, failed

def get_users():
    print("\n" + "=" * 50)
    print("Getting User List")
    print("=" * 50)
    r = requests.get(f"{BASE_URL}/api/users", headers=headers, params={"pageSize": 100}, timeout=10)
    if r.status_code == 200:
        data = r.json()
        print(f"Total users: {data['data']['total']}")
        for u in data['data']['data'][:5]:
            print(f"  - {u['userId']}: {u['name']} ({u['systemRole']})")
        if data['data']['total'] > 5:
            print(f"  ... and {data['data']['total'] - 5} more")
        return data['data']['total']
    return 0

def get_user_by_id(user_id):
    r = requests.get(f"{BASE_URL}/api/users/{user_id}", headers=headers, timeout=10)
    if r.status_code == 200:
        return r.json()
    return None

def create_projects():
    print("\n" + "=" * 50)
    print("Creating Projects")
    print("=" * 50)

    projects = [
        # Market projects (5)
        {"id": "MKT-001", "name": "印尼某电厂350MW汽轮发电机投标项目", "category": "MARKET", "capacity": "350MW", "model": "汽轮发电机", "isWon": True, "remark": "印尼国家电力公司"},
        {"id": "MKT-002", "name": "越南海防600MW燃气轮发电机技术方案", "category": "MARKET", "capacity": "600MW", "model": "燃气轮发电机", "isWon": None, "remark": "越南电力集团"},
        {"id": "MKT-003", "name": "巴基斯坦核电860MW发电机投标", "category": "MARKET", "capacity": "860MW", "model": "核能发电机", "isWon": True, "remark": "巴基斯坦原子能委员会"},
        {"id": "MKT-004", "name": "孟加拉国400MW联合循环电厂投标", "category": "MARKET", "capacity": "400MW", "model": "燃气轮发电机", "isWon": False, "remark": "孟加拉电力发展局"},
        {"id": "MKT-005", "name": "国内某电厂1000MW超超临界机组投标", "category": "MARKET", "capacity": "1000MW", "model": "汽轮发电机", "isWon": True, "remark": "华能集团"},
        # Regular projects (5)
        {"id": "PRJ-001", "name": "华能某电厂660MW汽轮发电机改造", "category": "EXECUTION", "capacity": "660MW", "model": "汽轮发电机", "remark": "华能集团"},
        {"id": "PRJ-002", "name": "国电某电厂500MW燃气轮机更换项目", "category": "EXECUTION", "capacity": "500MW", "model": "燃气轮发电机", "remark": "国电集团"},
        {"id": "PRJ-003", "name": "大唐某电厂300MW发电机增容改造", "category": "EXECUTION", "capacity": "300MW", "model": "汽轮发电机", "remark": "大唐集团"},
        {"id": "PRJ-004", "name": "华电某电厂850MW超超临界机组", "category": "EXECUTION", "capacity": "850MW", "model": "汽轮发电机", "remark": "华电集团"},
        {"id": "PRJ-005", "name": "国电投某电厂600MW燃气轮机发电机组", "category": "EXECUTION", "capacity": "600MW", "model": "燃气轮发电机", "remark": "国电投集团"},
        # Nuclear projects (5)
        {"id": "NUC-001", "name": "田湾核电7#机组1000MW发电机设计", "category": "NUCLEAR", "capacity": "1000MW", "model": "核能发电机", "remark": "华龙一号"},
        {"id": "NUC-002", "name": "昌江核电2#机组650MW发电机配合", "category": "NUCLEAR", "capacity": "650MW", "model": "核能发电机", "remark": "玲龙一号"},
        {"id": "NUC-003", "name": "漳州核电1#机组900MW发电机审图", "category": "NUCLEAR", "capacity": "900MW", "model": "核能发电机", "remark": "华龙一号"},
        {"id": "NUC-004", "name": "三门核电二期发电机技术澄清", "category": "NUCLEAR", "capacity": "800MW", "model": "核能发电机", "remark": "AP1000"},
        {"id": "NUC-005", "name": "海阳核电3#机组750MW设备调试", "category": "NUCLEAR", "capacity": "750MW", "model": "核能发电机", "remark": "CAP1400"},
        # R&D projects (5)
        {"id": "RD-001", "name": "1000MW级高效汽轮发电机研发", "category": "RESEARCH", "capacity": "1000MW", "model": "汽轮发电机", "remark": "效率提升"},
        {"id": "RD-002", "name": "燃气轮发电机高温绝缘材料研究", "category": "RESEARCH", "capacity": "600MW", "model": "燃气轮发电机", "remark": "材料研发"},
        {"id": "RD-003", "name": "核电发电机智能监测系统开发", "category": "RESEARCH", "capacity": "1000MW", "model": "核能发电机", "remark": "智能制造"},
        {"id": "RD-004", "name": "发电机定子绕组振动分析研究", "category": "RESEARCH", "capacity": "600MW", "model": "汽轮发电机", "remark": "结构分析"},
        {"id": "RD-005", "name": "300MW级模块化发电机设计", "category": "RESEARCH", "capacity": "300MW", "model": "汽轮发电机", "remark": "模块化设计"},
    ]

    success, failed = 0, 0
    for p in projects:
        try:
            # Convert to API format
            data = {
                "id": p["id"],
                "name": p["name"],
                "category": p["category"],
                "capacity": p.get("capacity", ""),
                "model": p.get("model", ""),
                "remark": p.get("remark", ""),
                "isWon": p.get("isWon"),
                "startDate": "2024-10-01",
                "endDate": "2025-12-31"
            }
            r = requests.post(f"{BASE_URL}/api/projects", headers=headers, json=data, timeout=10)
            if r.status_code in [200, 201]:
                print(f"[OK] [{p['id']}] {p['name'][:30]}...")
                success += 1
            else:
                print(f"[FAIL] [{p['id']}] {p['name'][:30]}... - {r.status_code}")
                failed += 1
        except Exception as e:
            print(f"[ERROR] [{p['id']}] - {e}")
            failed += 1
    print(f"\nSummary: Success={success}, Failed={failed}")
    return success, failed

def get_statistics():
    print("\n" + "=" * 50)
    print("Getting Statistics")
    print("=" * 50)

    endpoints = [
        "/api/statistics/personal",
        "/api/statistics/personal/tasks",
        "/api/statistics/team",
        "/api/statistics/workload",
        "/api/statistics/trend/monthly",
    ]

    for ep in endpoints:
        try:
            r = requests.get(f"{BASE_URL}{ep}", headers=headers, timeout=10)
            if r.status_code == 200:
                print(f"[OK] {ep}")
            else:
                print(f"[FAIL] {ep} - {r.status_code}")
        except Exception as e:
            print(f"[ERROR] {ep} - {e}")

def get_tasks():
    print("\n" + "=" * 50)
    print("Getting Tasks")
    print("=" * 50)
    r = requests.get(f"{BASE_URL}/api/tasks", headers=headers, params={"pageSize": 10}, timeout=10)
    if r.status_code == 200:
        data = r.json()
        print(f"Total tasks: {data['data']['total']}")
        for t in data['data']['data'][:3]:
            print(f"  - {t.get('taskId', t.get('taskID'))}: {t.get('taskName', t.get('TaskName'))[:30]}...")
        return data['data']['total']
    return 0

if __name__ == "__main__":
    print("API Testing with thermal-power-sample-data")
    print("=" * 50)

    create_users()
    get_users()
    create_projects()
    get_tasks()
    get_statistics()

    print("\n" + "=" * 50)
    print("API Testing Complete!")
    print("=" * 50)
