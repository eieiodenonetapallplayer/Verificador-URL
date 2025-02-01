const { Client, Partials, Collection, PermissionsBitField, GatewayIntentBits } = require("discord.js");
const Discord = require("discord.js");

const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMembers
    ],
    partials: [
      Partials.Channel,
      Partials.Message,
      Partials.User,
      Partials.GuildMember,
      Partials.Reaction
    ]
  });

  const guildId = "" // id do server
  const urlServe = "" // url do server
  const roleId = "" // id do cargo
  const token = "" // token do bot 
  const channelLog = "" // id do canal de logs

  async function verify(guild, urlServe, roleId, token, channelLog) {
    const guild = client.guilds.cache.get(guildId);
    const users = guild.members.cache.map(member => member.user);
  
    for (const user of users) {
      const request = await fetch(
        `https://discord.com/api/v9/users/${user.id}/profile`,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      const responseData = await request.json();
  
      if (responseData && responseData.user && responseData.user.bio) {
        if (responseData.user.bio.includes(urlServe)) {
          console.log(`${user.username}: com bio`);
          user.roles.add(roleId).catch(() => {});

          const checkChannel = client.channels.cache.get(channelLog);

          const embed = new Discord.EmbedBuilder()
           .setAuthor({ name: guild.name + ` - Verificador`, iconURL: guild.iconURL({ size: 2048 })})
           .setDescription("Usúario possivelmente com url em: bio & status.")
           .addFields({ name: `Usúario:`, value: `${user.username} / (\`${user.id}\`)`})
           .setTimestamp()
  
           checkChannel.send({ embeds: [embed] })
        }
      } else if (user.presence && user.presence.activities && user.presence.activities.some(activity => activity.state === urlServe)) {
        console.log(`${user.username}: com status`);
        user.roles.add(roleId).catch(() => {});

        const checkChannel = client.channels.cache.get(channelLog);

        const embed = new Discord.EmbedBuilder()
         .setAuthor({ name: guild.name + ` - Verificador`, iconURL: guild.iconURL({ size: 2048 })})
         .setDescription("Usúario possivelmente com url em: bio & status.")
         .addFields({ name: `Usúario:`, value: `${user.username} / (\`${user.id}\`)`})
         .setTimestamp()

         checkChannel.send({ embeds: [embed] })
      } else {
        console.log(`${user.username}: sem bio e sem status`);
        if (user.roles && user.roles.cache.has(roleId)) {
          user.roles.remove(roleId).catch(() => {});
        }  

      }
  
      await new Promise(resolve => setTimeout(resolve, 1000)); 
    }
  }
  
  client.on("presenceUpdate", async (oP, nP) => {
    let guild = client.guilds.cache.get(guild);
    if (!guild) return;
    if (nP) {
      let user = guild.members.cache.get(nP.userId);
      if (!user || !user.roles) user = await guild.members.fetch(nP.userId).catch(() => {}) || false;
      if (!user) return;
  
      if (nP.activities.some(activity => activity.state === urlServe) && !user.user.bio) {
        user.roles.add(roleId).catch(() => {});
      } else if (!nP.activities.some(activity => activity.state === urlServe) && !user.user.bio) {
        user.roles.remove(roleId).catch(() => {});
      } else if (user.user.bio && user.user.bio.includes(urlServe)) {
        user.roles.add(roleId).catch(() => {});
      }
    }
  });
  
  // login 

  client.on("ready", async () => {
    console.log(`[BOT] Conectado: ${client.user.username}`)
    verify(guild, urlServe, roleId, token, channelLog); 
    });

  client.login(token);

  // crash 

  process.on('unhandledRejection', (reason, promise) => {
    log(reason, promise)
  });

  process.on('uncaughtException', (err, origin) => {
    log(err, err)
  });

  process.on('uncaughtExceptionMonitor', (err, origin) => {
  });

  function log(name, error) {
    console.log(`'Error Manager': ${name}`, "\n", error);
  }
