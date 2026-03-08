# 🤖 Ollama Setup Guide

## Complete Installation and Configuration for Safety Platform

---

## Table of Contents

1. [What is Ollama?](#what-is-ollama)
2. [Installation](#installation)
3. [Model Selection](#model-selection)
4. [Configuration](#configuration)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)
7. [Performance Optimization](#performance-optimization)
8. [Production Deployment](#production-deployment)

---

## What is Ollama?

Ollama is a **FREE, open-source** tool that allows you to run large language models (LLMs) locally on your own hardware.

### Why Ollama for This Project?

✅ **100% FREE** - No API costs, no subscriptions
✅ **Runs Offline** - No internet required after model download
✅ **Privacy** - All data stays on your server
✅ **OpenAI-Compatible API** - Easy integration
✅ **Multiple Models** - Choose based on your hardware
✅ **Easy Installation** - One command setup

### Comparison with Paid APIs

| Feature | Ollama | OpenAI API | Azure OpenAI |
|---------|--------|------------|--------------|
| Cost | **FREE** | $0.002/1K tokens | $0.002/1K tokens |
| Privacy | 100% local | Sent to OpenAI | Sent to Azure |
| Internet Required | No (after setup) | Yes | Yes |
| Setup Complexity | Easy | Easy | Complex |
| Hardware Required | 8GB+ RAM | None | None |

---

## Installation

### Linux / macOS

```bash
# One-line installation
curl -fsSL https://ollama.com/install.sh | sh
```

### Windows

1. Download installer from [https://ollama.com/download](https://ollama.com/download)
2. Run the `.exe` installer
3. Ollama will be installed to `C:\Users\YourUser\AppData\Local\Programs\Ollama`

### Docker

```bash
docker pull ollama/ollama:latest

docker run -d \
  --name ollama \
  -p 11434:11434 \
  -v ollama_data:/root/.ollama \
  ollama/ollama:latest
```

### Verify Installation

```bash
ollama --version
# Expected output: ollama version 0.x.x
```

---

## Model Selection

### Hardware Requirements

| Model | RAM Required | Quality | Speed | Use Case |
|-------|-------------|---------|-------|----------|
| **phi3:mini** (8B) | 8GB | Excellent | Medium | **Recommended** |
| **phi3:mini.2** (3B) | 4GB | Good | Fast | Lower-end hardware |
| **tinyllama** (1.1B) | 2GB | Fair | Very Fast | Minimal hardware |
| **phi3:mini:70b** | 64GB | Best | Slow | High-end servers |

### Download Models

```bash
# Recommended for most users
ollama pull phi3:mini

# For lower-end hardware
ollama pull phi3:mini.2

# For minimal hardware
ollama pull tinyllama

# For best quality (requires powerful server)
ollama pull phi3:mini:70b
```

### List Downloaded Models

```bash
ollama list
```

**Expected Output:**
```
NAME                ID              SIZE      MODIFIED
phi3:mini:latest       a6990ed6be41    4.7 GB    2 hours ago
phi3:mini.2:latest     a1794e22a83e    2.0 GB    1 day ago
```

---

## Configuration

### Starting Ollama Server

**Linux/macOS:**
```bash
ollama serve
```

**Windows:**
- Ollama starts automatically as a service
- Or run from Command Prompt: `ollama serve`

**Docker:**
```bash
docker start ollama
```

### Default Configuration

- **Port:** 11434
- **Host:** localhost
- **API Endpoint:** http://localhost:11434/api/chat

### Custom Configuration

Create or edit `~/.ollama/config.json` (Linux/macOS) or `%USERPROFILE%\.ollama\config.json` (Windows):

```json
{
  "origins": ["*"],
  "models": "/path/to/models",
  "gpu": {
    "layers": 35
  }
}
```

### Environment Variables

```bash
# Use GPU (if available)
export OLLAMA_GPU=nvidia

# Change port
export OLLAMA_PORT=11435

# Custom model directory
export OLLAMA_MODELS=/path/to/models
```

---

## Testing

### Test 1: Check Ollama is Running

```bash
curl http://localhost:11434/api/tags
```

**Expected Response:**
```json
{
  "models": [
    {
      "name": "phi3:mini:latest",
      "modified_at": "2025-03-07T10:00:00Z",
      "size": 4668383232
    }
  ]
}
```

### Test 2: Generate Text

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "phi3:mini",
  "prompt": "Why is the sky blue?",
  "stream": false
}'
```

### Test 3: Chat Completion

```bash
curl http://localhost:11434/api/chat -d '{
  "model": "phi3:mini",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "What is 2+2?"
    }
  ],
  "stream": false
}'
```

**Expected Response:**
```json
{
  "model": "phi3:mini",
  "created_at": "2025-03-07T10:30:00Z",
  "message": {
    "role": "assistant",
    "content": "2+2 equals 4."
  },
  "done": true
}
```

### Test 4: Application Health Check

Once the Safety Platform backend is running:

```bash
curl http://localhost:5000/api/toolbox/health
```

**Expected Response:**
```json
{
  "success": true,
  "llm": {
    "healthy": true,
    "url": "http://localhost:11434",
    "model": "phi3:mini",
    "modelInstalled": true,
    "availableModels": ["phi3:mini:latest"]
  }
}
```

---

## Troubleshooting

### Issue 1: "Connection Refused"

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:11434
```

**Solutions:**

1. **Check if Ollama is running:**
   ```bash
   # Linux/macOS
   ps aux | grep ollama
   
   # Windows
   tasklist | findstr ollama
   ```

2. **Start Ollama:**
   ```bash
   ollama serve
   ```

3. **Check port:**
   ```bash
   # Linux/macOS
   lsof -i :11434
   
   # Windows
   netstat -ano | findstr 11434
   ```

### Issue 2: "Model Not Found"

**Symptoms:**
```json
{
  "error": "model 'phi3:mini' not found"
}
```

**Solutions:**

1. **List available models:**
   ```bash
   ollama list
   ```

2. **Download the model:**
   ```bash
   ollama pull phi3:mini
   ```

3. **Verify in application:**
   ```bash
   curl http://localhost:11434/api/tags
   ```

### Issue 3: Slow Generation

**Symptoms:**
- Document generation takes 2-5 minutes
- High CPU usage

**Solutions:**

1. **Use a smaller model:**
   ```bash
   ollama pull phi3:mini.2  # or tinyllama
   ```

2. **Update `.env` file:**
   ```env
   OLLAMA_MODEL=phi3:mini.2
   ```

3. **Enable GPU acceleration:**
   ```bash
   # NVIDIA GPU
   export OLLAMA_GPU=nvidia
   
   # Apple Silicon (M1/M2/M3)
   # GPU is enabled automatically
   ```

4. **Reduce generation length:**
   Edit `backend/services/llmService.js`:
   ```javascript
   options: {
     temperature: 0.7,
     num_predict: 1500  // Reduced from 3000
   }
   ```

### Issue 4: Out of Memory

**Symptoms:**
```
Error: failed to allocate memory
```

**Solutions:**

1. **Check RAM usage:**
   ```bash
   # Linux
   free -h
   
   # macOS
   top -l 1 | grep PhysMem
   
   # Windows
   wmic OS get FreePhysicalMemory
   ```

2. **Use smaller model:**
   ```bash
   ollama pull tinyllama
   ```

3. **Close other applications**

4. **Add swap space (Linux):**
   ```bash
   sudo fallocate -l 8G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

### Issue 5: Port Already in Use

**Symptoms:**
```
Error: address already in use: 11434
```

**Solutions:**

1. **Kill existing Ollama process:**
   ```bash
   # Linux/macOS
   pkill ollama
   
   # Windows
   taskkill /F /IM ollama.exe
   ```

2. **Use different port:**
   ```bash
   export OLLAMA_PORT=11435
   ollama serve
   ```

3. **Update `.env` file:**
   ```env
   OLLAMA_BASE_URL=http://localhost:11435
   ```

---

## Performance Optimization

### GPU Acceleration

**NVIDIA GPUs:**
```bash
# Install NVIDIA Container Toolkit (for Docker)
docker run -d \
  --gpus all \
  --name ollama \
  -p 11434:11434 \
  ollama/ollama:latest
```

**Apple Silicon (M1/M2/M3):**
- GPU acceleration is automatic
- No additional configuration needed

### Recommended Settings for Document Generation

**High Quality (phi3:mini, 8GB+ RAM):**
```javascript
options: {
  temperature: 0.7,
  top_p: 0.9,
  num_predict: 3000
}
```

**Balanced (phi3:mini.2, 4GB RAM):**
```javascript
options: {
  temperature: 0.7,
  top_p: 0.9,
  num_predict: 2000
}
```

**Fast (tinyllama, 2GB RAM):**
```javascript
options: {
  temperature: 0.8,
  top_p: 0.95,
  num_predict: 1500
}
```

---

## Production Deployment

### Option 1: Same Server as Application

**Pros:**
- Simple setup
- No network latency

**Cons:**
- Shares resources with application
- May slow down web requests during generation

**Setup:**
```bash
# Start Ollama as a service (Linux)
sudo systemctl enable ollama
sudo systemctl start ollama

# Or use PM2
pm2 start "ollama serve" --name ollama
pm2 save
```

### Option 2: Dedicated Ollama Server

**Pros:**
- Dedicated resources
- Can use high-end GPU server
- Scalable

**Cons:**
- More complex setup
- Network dependency

**Server Setup:**
```bash
# On Ollama server (e.g., 192.168.1.100)
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

**Application Setup:**
```env
# In application .env file
OLLAMA_BASE_URL=http://192.168.1.100:11434
```

### Option 3: Docker Compose

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped
    
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
      - OLLAMA_MODEL=phi3:mini
    depends_on:
      - ollama
    restart: unless-stopped

volumes:
  ollama_data:
```

**Deploy:**
```bash
docker-compose up -d
```

### Load Balancing (High Traffic)

For high-traffic production environments, run multiple Ollama instances:

```nginx
# nginx.conf
upstream ollama_backend {
    least_conn;
    server ollama1:11434;
    server ollama2:11434;
    server ophi3:mini:11434;
}

server {
    location /api/ {
        proxy_pass http://ollama_backend;
    }
}
```

---

## Security Best Practices

### 1. Network Security

```bash
# Firewall rules (allow only application server)
sudo ufw allow from 192.168.1.10 to any port 11434

# Or bind to localhost only
OLLAMA_HOST=127.0.0.1:11434 ollama serve
```

### 2. Resource Limits

**Using systemd (Linux):**
```ini
# /etc/systemd/system/ollama.service
[Service]
MemoryMax=10G
CPUQuota=400%
```

### 3. Monitoring

```bash
# Monitor Ollama resource usage
watch -n 1 'ps aux | grep ollama'

# Monitor model performance
curl http://localhost:11434/api/tags
```

---

## Frequently Asked Questions

### Q: Can I use Ollama with OpenAI's API format?

**A:** Yes! Ollama is compatible with OpenAI's API format. Just change the base URL:

```javascript
// Instead of: https://api.openai.com/v1
// Use: http://localhost:11434/v1
```

### Q: How much does it cost to run Ollama?

**A:** $0. Ollama is completely free and open-source. The only cost is your server hardware/electricity.

### Q: Can I use multiple models simultaneously?

**A:** Yes, Ollama can load multiple models. Just pull them:
```bash
ollama pull phi3:mini
ollama pull phi3:mini.2
ollama pull mistral
```

Then specify which model to use in your API calls.

### Q: How do I update Ollama?

```bash
# Linux/macOS
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Download and install latest version from ollama.com

# Docker
docker pull ollama/ollama:latest
```

### Q: Can I use Ollama offline?

**A:** Yes! After downloading models, Ollama works completely offline.

---

## Additional Resources

- **Official Documentation:** https://ollama.com/docs
- **Model Library:** https://ollama.com/library
- **GitHub Repository:** https://github.com/ollama/ollama
- **Discord Community:** https://discord.gg/ollama

---

**Last Updated:** March 7, 2025
**For:** Safety Platform v2.0.0
