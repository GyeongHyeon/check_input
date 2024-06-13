(() => {

            // HTML 요소에서 텍스트를 추출하고 저장하는 함수
            function extractAndSaveText() {
                // 결과를 저장할 배열
                let result = [];
                
                // 모든 h3 태그와 input 태그를 가져옴
                let h3Elements = document.querySelectorAll('h3');
                let inputElements = document.querySelectorAll('input');
                
                // h3 태그의 텍스트와 해당하는 input 태그의 값을 추출
                h3Elements.forEach((h3, index) => {
                    let input = inputElements[index];
                    let inputValue = input ? input.value.trim() : "false";
                    // input에 값이 없으면 "false" 저장
                    if (!inputValue) {
                        inputValue = "false";
                    }
                    result.push(`점검내용: ${h3.textContent.trim()}\n점검결과: ${inputValue}`);
                });
                
                // 결과를 텍스트 파일로 저장
                let blob = new Blob([result.join('\n\n')], { type: 'text/plain' });
                let link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'survey_results.txt';
                document.body.appendChild(link); // 페이지에 링크를 추가
                link.click(); // 클릭 이벤트 발생
                document.body.removeChild(link); // 사용 후 링크 제거
            }
    
            // 버튼 클릭 시 함수를 실행하도록 설정
            window.onload = function() {
                document.getElementById('saveButton').addEventListener('click', extractAndSaveText);
            }
    

}) ()