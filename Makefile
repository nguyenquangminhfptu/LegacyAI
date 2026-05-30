.DEFAULT_GOAL := help

.PHONY: help install run clean

help:
	@echo "Các lệnh khả dụng:"
	@echo "  make install  - Cài đặt các thư viện phụ thuộc bằng Poetry"
	@echo "  make run      - Khởi chạy ứng dụng FastAPI với Uvicorn (reload)"
	@echo "  make clean    - Dọn dẹp các tệp tin cache của Python (__pycache__)"

install:
	poetry lock
	poetry install

run:
	poetry run uvicorn backend.main:app --reload

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.py[cod]" -delete
	find . -type f -name "*$$py.class" -delete