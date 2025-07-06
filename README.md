# Learn

A comprehensive AI-powered coding practice platform that revolutionizes how developers learn and practice programming. Built with Next.js 15, this platform combines intelligent question generation, multi-language code execution, and a professional development environment to create an immersive coding experience.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [How It Works](#how-it-works)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Docker Setup](#docker-setup)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

Learn is not just another coding platform—it's an intelligent learning ecosystem that adapts to your programming journey. Whether you're a beginner taking your first steps in programming or an experienced developer sharpening your skills, Learn provides:

- **AI-Generated Problems**: Unique coding challenges tailored to your skill level and interests
- **Real-Time Code Execution**: Test your solutions instantly with our secure local execution environment
- **Professional IDE Experience**: Monaco Editor integration with syntax highlighting, autocomplete, and error detection
- **Multi-Language Support**: Practice in Python, Java, JavaScript, C, and C++
- **Responsive Design**: Optimized for both learning and productivity

## ✨ Features

### 🤖 AI Question Generation
- **Dynamic Problem Creation**: Generate unlimited unique coding problems using n8n workflow automation
- **Topic-Specific Challenges**: Focus on specific areas like arrays, algorithms, data structures
- **Difficulty Scaling**: Problems adapt to your skill level
- **Rich Problem Format**: Complete with examples, constraints, and detailed explanations

### 💻 Multi-Language Code Execution
- **Secure Local Execution**: Run code safely in isolated environments
- **Real-Time Results**: See output instantly as you code
- **Error Handling**: Comprehensive error reporting and debugging information
- **Performance Monitoring**: Execution time and memory usage tracking

### 🎨 Professional Development Environment
- **Monaco Editor**: The same editor that powers VS Code
- **Syntax Highlighting**: Full language support with intelligent highlighting
- **Auto-Completion**: Context-aware code suggestions
- **Error Detection**: Real-time syntax and semantic error detection
- **Theme Support**: Dark theme optimized for extended coding sessions

### 🏗️ Modern Architecture
- **Next.js 15**: Latest React framework with App Router
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first styling with custom dark theme
- **shadcn/ui**: Beautiful, accessible UI components
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

## 🔄 How It Works

### 1. Question Generation Workflow
```
User selects language & topic → Request sent to n8n webhook → AI generates problem → Problem displayed with examples and constraints
```

The platform integrates with n8n (automation platform) to generate coding problems:
- User selects programming language (Python, Java, JavaScript, C, C++)
- User chooses a topic or concept to focus on
- Request is sent to configured n8n webhook endpoint
- AI generates a unique problem with detailed description, examples, and constraints
- Problem is formatted and displayed in the question panel

### 2. Code Execution Pipeline
```
User writes code → Code validation → Secure execution → Result processing → Output display
```

Our secure execution environment:
- Code is written in the Monaco Editor with full IDE features
- On execution, code is validated and prepared for the target language
- Code runs in isolated temporary directories with resource limits
- Output, errors, and execution metrics are captured
- Results are formatted and displayed in the terminal panel

### 3. User Interaction Flow
```
Problem Generation → Code Writing → Testing → Debugging → Iteration
```

## 🏛️ Architecture

### Frontend Architecture
```
src/
├── app/                     # Next.js App Router
│   ├── api/                 # API Routes
│   │   ├── execute-interactive/ # Real-time code execution
│   │   └── generate-question/   # AI question generation
│   ├── layout.tsx          # Root layout with metadata
│   └── page.tsx            # Main application entry
├── components/             # React Components
│   ├── editor/            # Code editor components
│   │   ├── CodeEditor.tsx    # Monaco editor wrapper
│   │   └── ControlsBar.tsx   # Editor controls
│   ├── layout/            # Layout components
│   │   ├── CodingPlayground.tsx # Main layout container
│   │   └── ResizeHandle.tsx     # Panel resizing
│   ├── question/          # Question display
│   │   └── QuestionPanel.tsx    # Problem presentation
│   ├── terminal/          # Output display
│   │   └── InteractiveTerminal.tsx # Execution results
│   └── ui/               # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
├── types/                # TypeScript type definitions
└── constants/            # Application constants
```

### Backend Architecture
- **API Routes**: RESTful endpoints for code execution and question generation
- **Code Execution Engine**: Secure subprocess management for multi-language support
- **n8n Integration**: Webhook-based AI question generation
- **Error Handling**: Comprehensive error catching and user-friendly messaging

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Package manager (comes with Node.js)
- **Programming Language Runtimes**:
  - **Python** (3.8+) - [Download here](https://www.python.org/downloads/)
  - **Java JDK** (11+) - [Download here](https://openjdk.org/)
  - **GCC/G++** - For C/C++ compilation
    - Windows: [MinGW](https://www.mingw-w64.org/) or [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
    - macOS: Xcode Command Line Tools (`xcode-select --install`)
    - Linux: `sudo apt-get install build-essential` (Ubuntu/Debian)

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/NIKHILSAI71/Learn.git
   cd Learn
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   
   Create environment file:
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables in `.env.local`:
   ```env
   # n8n Webhook Configuration
   N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/your-webhook-id
   
   # Optional: Custom execution timeouts
   CODE_EXECUTION_TIMEOUT=10000
   
   # Optional: Debug mode
   DEBUG_MODE=false
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## 🐳 Docker Setup

### Using Docker (Recommended for Production)

1. **Build Docker Image**
   ```bash
   docker build -t learn-platform .
   ```

2. **Run Container**
   ```bash
   docker run -p 3000:3000 -e N8N_WEBHOOK_URL=your_webhook_url learn-platform
   ```

### Using Docker Compose

For connecting with external n8n container, use the provided `docker-compose.yml`:

```yaml
services:
  learn-app:
    container_name: learn-app
    build:
      context: .
      dockerfile: Dockerfile
      args:
        GITHUB_REPO_URL: https://github.com/NIKHILSAI71/Learn.git
        BRANCH: master
      no_cache: true
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - N8N_WEBHOOK_URL=http://n8n-container:5678/webhook/learn
      - CODE_EXECUTION_TIMEOUT=${CODE_EXECUTION_TIMEOUT:-10000}
      - DEBUG_MODE=${DEBUG_MODE:-false}
    volumes:
      - code-execution-temp:/tmp/code-execution
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - learn-network
    external_links:
      - n8n-container

volumes:
  code-execution-temp:
    driver: local

networks:
  learn-network:
    external: true
```

### Network Configuration

The docker-compose.yml is configured to automatically connect to the `learn-network`. Before running:

1. **Create the network**:
   ```bash
   docker network create learn-network
   ```

2. **Connect existing n8n container to the network**:
   ```bash
   docker network connect learn-network n8n-container
   ```

3. **Run the application**:
   ```bash
   docker-compose up
   ```

The application will automatically connect to the external `learn-network` and communicate with the n8n container using the hostname `n8n-container`.

## 📖 Usage Guide

### Getting Started with Your First Problem

1. **Select Programming Language**
   - Choose from Python, Java, JavaScript, C, or C++
   - Each language has full syntax support and execution capabilities

2. **Choose a Topic**
   - Select from various programming concepts:
     - Data Structures (Arrays, Lists, Trees, Graphs)
     - Algorithms (Sorting, Searching, Dynamic Programming)
     - Object-Oriented Programming
     - String Manipulation
     - Mathematical Problems

3. **Generate Problem**
   - Click "Generate Question" to create a unique coding challenge
   - Review the problem description, examples, and constraints
   - Understand the input/output format

4. **Write Your Solution**
   - Use the Monaco Editor with full IDE features
   - Take advantage of syntax highlighting and autocomplete
   - Write clean, well-commented code

5. **Test Your Code**
   - Click "Run Code" to execute your solution
   - Review output in the terminal panel
   - Debug any errors or unexpected results

6. **Iterate and Improve**
   - Modify your code based on results
   - Test with different inputs
   - Optimize for better performance

### Advanced Features

#### Code Editor Shortcuts
- **Ctrl/Cmd + S**: Format code
- **Ctrl/Cmd + /**: Toggle comments
- **Ctrl/Cmd + D**: Duplicate line
- **Alt + Up/Down**: Move line up/down
- **Ctrl/Cmd + F**: Find and replace

#### Terminal Features
- **Clear Output**: Reset terminal display
- **Copy Results**: Copy execution results to clipboard
- **Export Code**: Save your solution to a file

## � API Documentation

### Generate Question Endpoint

**POST** `/api/generate-question`

Generate a new coding problem based on specified parameters.

**Request Body:**
```json
{
  "language": "python",    // Required: python, java, javascript, c, cpp
  "topic": "arrays"        // Required: arrays, strings, algorithms, etc.
}
```

**Response:**
```json
{
  "title": "Two Sum Problem",
  "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  "constraints": [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "Only one valid answer exists"
  ],
  "examples": [
    {
      "input": "nums = [2,7,11,15], target = 9",
      "output": "[0,1]",
      "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]"
    }
  ],
  "difficulty": "Medium"
}
```

### Execute Code Endpoint

**POST** `/api/execute-interactive`

Execute code in the specified programming language.

**Request Body:**
```json
{
  "language": "python",
  "code": "print('Hello, World!')"
}
```

**Response:**
```json
{
  "output": "Hello, World!\n",
  "error": null,
  "executionTime": 45,
  "success": true
}
```

## ⚙️ Configuration

### n8n Webhook Setup

Learn integrates with n8n for AI-powered question generation. The application is configured to communicate with n8n containers via Docker networking.

#### Option 1: Existing n8n Container

If you have an existing n8n container running:

1. **Find your n8n container name**:
   ```bash
   docker ps
   ```

2. **Create shared network**:
   ```bash
   docker network create learn-network
   ```

3. **Connect n8n container to network**:
   ```bash
   docker network connect learn-network your-n8n-container-name
   ```

4. **Update webhook URL** in your n8n workflow to use container networking:
   - Internal URL: `http://learn-app:3000/api/webhook`
   - External URL: `http://localhost:3000/api/webhook`

#### Option 2: New n8n Installation

1. **Install n8n with Docker**:
   ```bash
   docker run -d \
     --name n8n-container \
     --network learn-network \
     -p 5678:5678 \
     -v n8n_data:/home/node/.n8n \
     n8nio/n8n
   ```

2. **Access n8n**: Open http://localhost:5678

3. **Create Webhook Workflow**:
   - Add Webhook node
   - Configure webhook to receive POST requests at `/webhook/learn`
   - Add AI integration (OpenAI, Claude, etc.)
   - Set up response formatting

#### Testing the Connection

Test the webhook connection from within the learn-app container:

```bash
docker exec learn-app node -e "
const http = require('http');
const data = JSON.stringify({language: 'python', topic: 'arrays'});
const options = {
  hostname: 'n8n-container',
  port: 5678,
  path: '/webhook/learn',
  method: 'POST',
  headers: {'Content-Type': 'application/json'}
};
const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  res.on('data', (d) => console.log('Response:', d.toString()));
});
req.on('error', (e) => console.error('Error:', e.message));
req.write(data);
req.end();
"
```

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `N8N_WEBHOOK_URL` | n8n webhook endpoint (use container name for Docker networking) | - | Yes |
| `CODE_EXECUTION_TIMEOUT` | Maximum execution time (ms) | 10000 | No |
| `DEBUG_MODE` | Enable debug logging | false | No |
| `MAX_OUTPUT_LENGTH` | Maximum output characters | 10000 | No |

#### Docker Networking URLs

When running in Docker containers, use these URL patterns:

- **Development/Local**: `http://localhost:5678/webhook/learn`
- **Docker Compose**: `http://n8n-container:5678/webhook/learn`
- **External n8n**: `http://your-n8n-container-name:5678/webhook/learn`

### Language Runtime Configuration

Ensure the following commands work in your environment:

```bash
# Python
python --version  # Should be 3.8+

# Java
javac -version   # Should be 11+
java -version

# Node.js
node --version   # Should be 16+

# GCC (for C/C++)
gcc --version
g++ --version
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Configure environment variables
   - Deploy automatically on every push

3. **Configure Environment Variables**
   Add your environment variables in Vercel dashboard:
   - `N8N_WEBHOOK_URL`
   - Any other custom configuration

### Docker Deployment

1. **Build Production Image**
   ```bash
   docker build -t learn-platform:latest .
   ```

2. **Deploy to Container Platform**
   - **AWS ECS/Fargate**
   - **Google Cloud Run**
   - **Azure Container Instances**
   - **DigitalOcean App Platform**

### Self-Hosted

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

## 🤝 Contributing

We welcome contributions to make Learn even better! Here's how you can help:

### Development Setup

1. **Fork the Repository**
   ```bash
   git clone https://github.com/NIKHILSAI71/Learn.git
   cd Learn
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

### Contribution Guidelines

- **Code Style**: Follow existing TypeScript and React patterns
- **Testing**: Add tests for new features
- **Documentation**: Update README and inline comments
- **Commits**: Use conventional commit messages
- **Pull Requests**: Include detailed description of changes

### Areas for Contribution

- **New Programming Languages**: Add support for more languages
- **UI/UX Improvements**: Enhance user interface and experience
- **Performance Optimization**: Improve code execution speed
- **Security Enhancements**: Strengthen code execution security
- **Documentation**: Improve guides and examples

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### 1. Code Execution Errors

**Problem**: Code doesn't execute or returns errors

**Solutions**:
- Verify language runtime is installed and in PATH
- Check code syntax and logic
- Ensure proper file permissions
- Review execution timeout settings

**Example Fix**:
```bash
# Check if Python is accessible
python --version
which python

# Check if Java is accessible
javac -version
java -version
which java
```

#### 2. n8n Webhook Issues

**Problem**: Questions not generating or network connection failed

**Solutions**:
- Verify n8n container is running: `docker ps`
- Check if containers are on same network: `docker network ls`
- Ensure webhook URL uses container name: `http://n8n-container:5678/webhook/learn`
- Test webhook manually from within learn-app container

**Network Connection Test**:
```bash
# Check if containers can communicate
docker exec learn-app ping n8n-container

# Test webhook endpoint
docker exec learn-app curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"language":"python","topic":"arrays"}' \
  http://n8n-container:5678/webhook/learn
```

**Network Troubleshooting**:
```bash
# List networks
docker network ls

# Inspect network details
docker network inspect learn-network

# Connect container to network
docker network connect learn-network container-name
```

#### 3. Monaco Editor Issues

**Problem**: Editor not loading or functioning

**Solutions**:
- Check internet connection (CDN dependency)
- Verify @monaco-editor/react installation
- Clear browser cache
- Check console for JavaScript errors

#### 4. Build/Deployment Issues

**Problem**: Application fails to build or deploy

**Solutions**:
- Check Node.js version compatibility
- Verify all dependencies are installed
- Review TypeScript errors
- Check environment variable configuration

### Getting Help

If you encounter issues not covered here:

1. **Check Existing Issues**: Browse [GitHub Issues](https://github.com/NIKHILSAI71/Learn/issues)
2. **Create New Issue**: Provide detailed description and steps to reproduce
3. **Join Discussions**: Participate in [GitHub Discussions](https://github.com/NIKHILSAI71/Learn/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team**: For the amazing React framework
- **Monaco Editor**: For the professional code editor
- **shadcn/ui**: For beautiful, accessible UI components
- **n8n Community**: For the powerful automation platform
- **Open Source Community**: For continuous inspiration and contributions

---

**Happy Coding! 🚀**

For more information, visit our [GitHub repository](https://github.com/NIKHILSAI71/Learn).
