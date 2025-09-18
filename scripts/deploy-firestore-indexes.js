#!/usr/bin/env node

/**
 * Script para implantar índices do Firestore
 * 
 * Este script verifica e implanta os índices necessários para o Firestore
 * baseado na configuração em firestore.indexes.json
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Cores para output no terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFirebaseTools() {
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    log('✓ Firebase CLI encontrado', 'green');
    return true;
  } catch (error) {
    log('✗ Firebase CLI não encontrado. Instale com: npm install -g firebase-tools', 'red');
    return false;
  }
}

function checkIndexesFile() {
  const indexesPath = path.join(process.cwd(), 'firestore.indexes.json');
  
  if (!fs.existsSync(indexesPath)) {
    log('✗ Arquivo firestore.indexes.json não encontrado', 'red');
    return false;
  }

  try {
    const indexesContent = JSON.parse(fs.readFileSync(indexesPath, 'utf8'));
    log(`✓ Arquivo firestore.indexes.json válido com ${indexesContent.indexes.length} índices`, 'green');
    
    // Mostrar índices que serão criados
    log('\nÍndices a serem criados:', 'blue');
    indexesContent.indexes.forEach((index, i) => {
      const fields = index.fields.map(f => `${f.fieldPath} (${f.order})`).join(', ');
      log(`  ${i + 1}. Collection: ${index.collectionGroup} - Fields: ${fields}`, 'yellow');
    });
    
    return true;
  } catch (error) {
    log('✗ Erro ao ler firestore.indexes.json: ' + error.message, 'red');
    return false;
  }
}

function deployIndexes() {
  try {
    log('\nIniciando implantação dos índices...', 'blue');
    
    // Executar o comando de deploy dos índices
    const output = execSync('firebase deploy --only firestore:indexes', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    log('✓ Índices implantados com sucesso!', 'green');
    log('\nOutput do Firebase:', 'blue');
    console.log(output);
    
    log('\n📝 Próximos passos:', 'yellow');
    log('1. Aguarde a construção dos índices no console do Firebase', 'yellow');
    log('2. Os índices podem levar alguns minutos para serem construídos', 'yellow');
    log('3. Verifique o status em: https://console.firebase.google.com', 'yellow');
    
    return true;
  } catch (error) {
    log('✗ Erro ao implantar índices:', 'red');
    console.error(error.message);
    return false;
  }
}

function main() {
  log('🔥 Script de Implantação de Índices do Firestore', 'blue');
  log('=' .repeat(50), 'blue');
  
  // Verificações preliminares
  if (!checkFirebaseTools()) {
    process.exit(1);
  }
  
  if (!checkIndexesFile()) {
    process.exit(1);
  }
  
  // Confirmar implantação
  log('\n⚠️  Este script irá implantar os índices do Firestore.', 'yellow');
  log('Tem certeza que deseja continuar? (y/N)', 'yellow');
  
  // Em um ambiente de produção, você poderia adicionar prompt para confirmação
  // Por agora, vamos prosseguir automaticamente
  
  if (deployIndexes()) {
    log('\n🎉 Implantação concluída!', 'green');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  checkFirebaseTools,
  checkIndexesFile,
  deployIndexes
};