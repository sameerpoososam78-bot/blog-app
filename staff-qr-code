<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Staff ID QR - Live Excel View Edition</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800&family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
    <!-- SheetJS Library for Excel Generation -->
    <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Poppins', sans-serif; }
        body {
            background: radial-gradient(circle at 50% 20%, #1e0938, #0a0b1c, #030308);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 30px 15px;
            overflow-x: hidden;
            position: relative;
        }
        .bg-orb { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.35; pointer-events: none; }
        .orb-left { width: 300px; height: 300px; background: #00f0ff; top: 15%; left: 10%; }
        .orb-right { width: 320px; height: 320px; background: #9d00ff; bottom: 15%; right: 10%; }

        .nav-switch { position: absolute; top: 20px; z-index: 10; display: flex; gap: 10px; }
        .nav-btn {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #fff; padding: 8px 16px; border-radius: 20px;
            font-family: 'Orbitron', sans-serif; font-size: 11px; cursor: pointer; transition: 0.3s;
        }
        .nav-btn.active, .nav-btn:hover { background: #00f0ff; color: #030308; box-shadow: 0 0 15px rgba(0, 240, 255, 0.6); }

        .cyber-stage { display: flex; align-items: center; justify-content: center; width: 100%; max-width: 500px; position: relative; z-index: 2; margin-top: 50px; }
        .cyber-stage.admin-stage { max-width: 1000px; }
        .center-hub { width: 100%; position: relative; }

        .card-container {
            background: rgba(16, 17, 36, 0.88);
            backdrop-filter: blur(18px);
            border: 1px solid rgba(0, 240, 255, 0.3);
            border-radius: 22px;
            padding: 35px 25px 25px 25px;
            box-shadow: 0 0 40px rgba(0, 240, 255, 0.15), 0 20px 60px rgba(0, 0, 0, 0.9);
        }

        .title {
            font-family: 'Orbitron', sans-serif; color: #ffffff; font-size: 20px;
            text-align: center; letter-spacing: 2px; text-shadow: 0 0 12px #00f0ff; margin-bottom: 22px;
        }

        .input-group { display: flex; flex-direction: column; gap: 11px; }
        input, select {
            width: 100%; padding: 12px 14px; background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; color: #ffffff; font-size: 14px; outline: none;
        }
        input::placeholder { color: #7d84a0; }
        select option { background-color: #101124; color: #ffffff; }

        .btn {
            width: 100%; padding: 13px; border: none; border-radius: 8px;
            font-weight: 600; font-size: 15px; cursor: pointer; text-transform: uppercase;
            letter-spacing: 1px; transition: 0.3s ease; margin-top: 15px;
        }
        .btn-generate { background: linear-gradient(135deg, #ff2a6d, #9b00e8); color: #fff; }
        .btn-download { background: linear-gradient(135deg, #00f0ff, #0077fe); color: #fff; }
        .btn-whatsapp { background: linear-gradient(135deg, #25D366, #128C7E); color: #fff; text-decoration: none; display: block; text-align: center; }
        .btn-copy { background: linear-gradient(135deg, #ff9900, #ff5500); color: #fff; }
        .btn-reset { background: rgba(255, 255, 255, 0.1); color: #bbb; }
        .btn-master { background: linear-gradient(135deg, #00ff87, #60efff); color: #030308; }
        .btn-excel { background: linear-gradient(135deg, #107c41, #1f4e79); color: #fff; }
        .btn-danger { background: linear-gradient(135deg, #ff4d4d, #cc0000); color: #fff; font-size: 12px; padding: 8px; margin-top: 10px; }

        #resultSection, #scanVerifyStage, #masterQrSection { display: none; text-align: center; }
        .qr-wrapper { background: #ffffff; padding: 14px; border-radius: 12px; display: inline-block; margin: 15px 0; }
        #qrImage, #masterQrImage { display: block; width: 190px; height: 190px; margin: 0 auto; }

        .info-box {
            text-align: left; background: rgba(255, 255, 255, 0.05);
            padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .info-box p { font-size: 14px; color: #ddd; margin-bottom: 8px; word-break: break-all; }

        /* --- Excel Table View Styles --- */
        .table-container {
            width: 100%;
            max-height: 320px;
            overflow-y: auto;
            margin-top: 15px;
            border: 1px solid rgba(0, 240, 255, 0.2);
            border-radius: 8px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 12px;
            color: #fff;
        }
        th, td {
            padding: 10px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        th {
            background: rgba(0, 240, 255, 0.15);
            font-family: 'Orbitron', sans-serif;
            color: #00f0ff;
            position: sticky;
            top: 0;
            z-index: 1;
        }
        tr:hover { background: rgba(255, 255, 255, 0.03); }
    </style>
</head>
<body>

    <div class="bg-orb orb-left"></div>
    <div class="bg-orb orb-right"></div>

    <div class="nav-switch" id="topNavSwitch">
        <button class="nav-btn active" id="genTabBtn" onclick="switchView('generator')">⚡ Generator</button>
        <button class="nav-btn" id="adminTabBtn" onclick="switchView('admin')">📊 Live Excel Register View</button>
    </div>

    <!-- 1. Generator View (Staff Form) -->
    <div class="cyber-stage" id="generatorStage">
        <div class="center-hub">
            <div class="card-container">
                <form id="staffForm" onsubmit="handleFormSubmit(event)">
                    <h2 class="title">STAFF ID QR</h2>
                    <div class="input-group">
                        <input type="text" id="name" placeholder="Teacher / Staff Full Name" required>
                        <input type="text" id="staffId" placeholder="Staff ID (e.g. EMP101)" style="text-transform: uppercase;" required>
                        <input type="tel" id="phone" placeholder="Mobile No (10 Digits)" maxlength="10" required>
                        <select id="department" required>
                            <option value="">-- Choose Department --</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Administration">Administration</option>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Commerce & Management">Commerce & Management</option>
                            <option value="Humanities & Science">Humanities & Science</option>
                        </select>
                        <input type="number" id="luckyNumber" placeholder="Lucky Number" required>
                    </div>
                    <button type="submit" id="submitBtn" class="btn btn-generate">Generate Staff QR ⚡</button>
                </form>

                <div id="resultSection">
                    <h2 class="title">STAFF IDENTITY SECURED</h2>
                    <div class="qr-wrapper"><img id="qrImage" src="" alt="Staff QR Code"></div>
                    <button class="btn btn-download" onclick="downloadQR()">Download QR Code ⬇</button>
                    <button class="btn btn-excel" onclick="downloadSingleExcel()">Download Single Excel (.xlsx) 📊</button>
                    <a id="whatsappShareBtn" href="#" target="_blank" class="btn btn-whatsapp">Share Link on WhatsApp 💬</a>
                    <button class="btn btn-reset" onclick="resetForm()">New Identity ↺</button>
                </div>
            </div>
        </div>
    </div>

    <!-- 2. Scan & Submit View -->
    <div class="cyber-stage" id="scanVerifyStage" style="display: none;">
        <div class="center-hub">
            <div class="card-container">
                <h2 class="title">STAFF DETAILS</h2>
                <div class="info-box">
                    <p><strong>Name:</strong> <span id="scanName">-</span></p>
                    <p><strong>Staff ID:</strong> <span id="scanStaffId">-</span></p>
                    <p><strong>Mobile:</strong> <span id="scanPhone">-</span></p>
                    <p><strong>Department:</strong> <span id="scanDepartment">-</span></p>
                    <p><strong>Lucky Number:</strong> <span id="scanLuckyNumber">-</span></p>
                </div>
                <button class="btn btn-copy" onclick="copyStaffDetails()">Copy All Details 📋</button>
                <button class="btn btn-excel" onclick="saveScannedToExcelRegister()">Save & Download Excel Record 📊</button>
            </div>
        </div>
    </div>

    <!-- 3. Admin View with Live Excel Table View -->
    <div class="cyber-stage admin-stage" id="adminStage" style="display: none;">
        <div class="center-hub">
            <div class="card-container">
                <h2 class="title">LIVE EXCEL REGISTER VIEW</h2>
                <p style="color: #bbb; font-size: 13px; margin-bottom: 10px; text-align: center;">All registered staff records are listed below like an Excel sheet:</p>
                
                <!-- Excel Table View Container -->
                <div class="table-container">
                    <table id="excelTable">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Type</th>
                                <th>Name</th>
                                <th>Staff ID</th>
                                <th>Phone</th>
                                <th>Department</th>
                                <th>Lucky No</th>
                            </tr>
                        </thead>
                        <tbody id="tableBody">
                            <!-- Rows will be injected dynamically -->
                        </tbody>
                    </table>
                </div>

                <button class="btn btn-excel" onclick="downloadFullRegisterExcel()" style="margin-top: 15px;">📥 Download Master Excel Register (.xlsx)</button>
                <button class="btn btn-danger" onclick="clearRegister()">Clear All Records 🗑️</button>
                <button class="btn btn-master" onclick="generateMasterQR()" style="margin-top: 10px;">Generate Master QR ⚡</button>

                <div id="masterQrSection">
                    <h3 class="title" style="margin-top: 20px; font-size: 16px;">MASTER APP QR</h3>
                    <div class="qr-wrapper"><img id="masterQrImage" src="" alt="Master QR Code"></div>
                    <p style="color: #bbb; font-size: 12px; margin-top: 5px;">Scan this to open the live app directly.</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        let currentQRUrl = "";
        let scannedPayload = {};
        let currentFormData = {};

        document.getElementById('phone').addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
        });

        window.addEventListener('DOMContentLoaded', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const name = urlParams.get('name');
            
            if (name) {
                scannedPayload = {
                    type: "Staff Verification Scan",
                    name: name,
                    staffId: urlParams.get('staffId') || '',
                    phone: urlParams.get('phone') || '',
                    department: urlParams.get('department') || '',
                    luckyNumber: urlParams.get('luckyNumber') || '',
                    timestamp: new Date().toLocaleString()
                };

                document.getElementById('scanName').innerText = scannedPayload.name;
                document.getElementById('scanStaffId').innerText = scannedPayload.staffId;
                document.getElementById('scanPhone').innerText = scannedPayload.phone;
                document.getElementById('scanDepartment').innerText = scannedPayload.department;
                document.getElementById('scanLuckyNumber').innerText = scannedPayload.luckyNumber;

                document.getElementById('generatorStage').style.display = 'none';
                document.getElementById('scanVerifyStage').style.display = 'flex';
                document.getElementById('topNavSwitch').style.display = 'none';
            }
            loadExcelTableData();
        });

        function switchView(view) {
            const genStage = document.getElementById('generatorStage');
            const adminStage = document.getElementById('adminStage');
            const genBtn = document.getElementById('genTabBtn');
            const adminBtn = document.getElementById('adminTabBtn');

            if (view === 'generator') {
                genStage.style.display = 'flex';
                adminStage.style.display = 'none';
                genBtn.classList.add('active');
                adminBtn.classList.remove('active');
            } else {
                genStage.style.display = 'none';
                adminStage.style.display = 'flex';
                adminBtn.classList.add('active');
                genBtn.classList.remove('active');
                loadExcelTableData(); // टेबल को रिफ्रेश करें
            }
        }

        function handleFormSubmit(event) {
            event.preventDefault();

            const name = document.getElementById('name').value.trim();
            const staffId = document.getElementById('staffId').value.trim().toUpperCase();
            const phone = document.getElementById('phone').value.trim();
            const department = document.getElementById('department').value;
            const luckyNumber = document.getElementById('luckyNumber').value.trim();

            if (phone.length !== 10) {
                alert("Please enter a valid 10-digit Phone Number!");
                return;
            }

            currentFormData = {
                Timestamp: new Date().toLocaleTimeString(),
                Type: "Staff Registration",
                Name: name,
                StaffId: staffId,
                Phone: phone,
                Department: department,
                LuckyNumber: luckyNumber
            };

            saveToLocalStorageRegister(currentFormData);

            const baseUrl = window.location.href.split('?')[0];
            const qrLink = `${baseUrl}?name=${encodeURIComponent(name)}&staffId=${encodeURIComponent(staffId)}&phone=${encodeURIComponent(phone)}&department=${encodeURIComponent(department)}&luckyNumber=${encodeURIComponent(luckyNumber)}`;
            
            currentQRUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrLink)}`;
            document.getElementById('qrImage').src = currentQRUrl;

            const whatsappMsg = `*STAFF ID QR*%0A*Name:* ${encodeURIComponent(name)}%0A*Staff ID:* ${encodeURIComponent(staffId)}%0A*Scan Staff ID:* ${encodeURIComponent(qrLink)}`;
            document.getElementById('whatsappShareBtn').href = `https://api.whatsapp.com/send?text=${whatsappMsg}`;

            document.getElementById('staffForm').style.display = "none";
            document.getElementById('resultSection').style.display = "block";
        }

        function saveToLocalStorageRegister(record) {
            let register = JSON.parse(localStorage.getItem('staffExcelRegister')) || [];
            register.push(record);
            localStorage.setItem('staffExcelRegister', JSON.stringify(register));
        }

        // स्क्रीन पर एक्सेल शीट की तरह टेबल लोड करना
        function loadExcelTableData() {
            let register = JSON.parse(localStorage.getItem('staffExcelRegister')) || [];
            let tbody = document.getElementById('tableBody');
            tbody.innerHTML = "";

            if (register.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #7d84a0;">No records found yet.</td></tr>`;
                return;
            }

            register.reverse().forEach(row => {
                let tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.Timestamp || '-'}</td>
                    <td>${row.Type || '-'}</td>
                    <td>${row.Name || '-'}</td>
                    <td>${row.StaffId || '-'}</td>
                    <td>${row.Phone || '-'}</td>
                    <td>${row.Department || '-'}</td>
                    <td>${row.LuckyNumber || '-'}</td>
                `;
                tbody.appendChild(tr);
            });
        }

        function downloadSingleExcel() {
            const worksheet = XLSX.utils.json_to_sheet([currentFormData]);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Staff Details");
            XLSX.writeFile(workbook, `${currentFormData.StaffId || 'Staff'}_Record.xlsx`);
        }

        function saveScannedToExcelRegister() {
            saveToLocalStorageRegister(scannedPayload);
            loadExcelTableData();
            const worksheet = XLSX.utils.json_to_sheet([scannedPayload]);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Scan Record");
            XLSX.writeFile(workbook, `${scannedPayload.staffId || 'Scan'}_Attendance.xlsx`);
            alert("Record saved to Excel register successfully! ✅");
        }

        function downloadFullRegisterExcel() {
            let register = JSON.parse(localStorage.getItem('staffExcelRegister')) || [];
            if (register.length === 0) {
                alert("No records found in the register yet!");
                return;
            }
            const worksheet = XLSX.utils.json_to_sheet(register);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "All Staff Register");
            XLSX.writeFile(workbook, "Staff_Master_Register.xlsx");
        }

        function clearRegister() {
            if (confirm("Are you sure you want to delete all saved records?")) {
                localStorage.removeItem('staffExcelRegister');
                loadExcelTableData();
                alert("Register cleared successfully!");
            }
        }

        async function copyStaffDetails() {
            const textToCopy = `Name: ${scannedPayload.name}\nStaff ID: ${scannedPayload.staffId}\nMobile: ${scannedPayload.phone}\nDepartment: ${scannedPayload.department}\nLucky Number: ${scannedPayload.luckyNumber}`;
            try {
                await navigator.clipboard.writeText(textToCopy);
                alert("Staff details copied to clipboard! 📋");
            } catch (err) {
                alert("Failed to copy details.");
            }
        }

        function generateMasterQR() {
            const masterQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(window.location.href.split('?')[0])}`;
            document.getElementById('masterQrImage').src = masterQrUrl;
            document.getElementById('masterQrSection').style.display = "block";
        }

        async function downloadQR() {
            if (!currentQRUrl) return;
            try {
                const res = await fetch(currentQRUrl);
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Staff-QR.png';
                a.click();
            } catch (e) {
                window.open(currentQRUrl, '_blank');
            }
        }

        function resetForm() {
            document.getElementById('staffForm').reset();
            document.getElementById('resultSection').style.display = "none";
            document.getElementById('staffForm').style.display = "block";
        }
    </script>
</body>
</html>
