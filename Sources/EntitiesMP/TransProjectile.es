5015
%{
#include "EntitiesMP/StdH/StdH.h"
%}

uses "EntitiesMP/Player";

event ELaunchTP {
  CEntityPointer penLauncher,     // who launched it
};

%{
void CTransProjectile_OnPrecache(CDLLEntityClass *pdec, INDEX iUser) 
{
  pdec->PrecacheModel(MODEL_TP);
  pdec->PrecacheTexture(TEXTURE_TP);
}

#define ECF_TP ( \
  ((ECBI_BRUSH)<<ECB_TEST) |\
  ((ECBI_MODEL|ECBI_CORPSE|ECBI_ITEM|ECBI_PROJECTILE_MAGIC|ECBI_PROJECTILE_SOLID)<<ECB_PASS) |\
  ((ECBI_MODEL)<<ECB_IS))

#define EPF_TP  ( \
  EPF_ONBLOCK_STOP|EPF_ORIENTEDBYGRAVITY|\
  EPF_TRANSLATEDBYGRAVITY|EPF_MOVABLE)
%}


class CTransProjectile : CMovableModelEntity {
  name      "TransProjectile";
  thumbnail "";
  features "ImplementsOnPrecache";

properties:

  1 CEntityPointer m_penLauncher,  // owner
  2 FLOAT m_tmSpiritStart = 0.0f,  // time when spirit effect has started
  3 BOOL  m_bParticlesFlying = TRUE,  // particle rendering flag
  4 FLOAT m_fStartTime = 0.0f,  // time we started moving
  5 BOOL  m_bChangePhysics = TRUE,  // change physics flag

components:
  
  1 model   MODEL_TP          "Models\\TeleporterGun\\Projectile\\Projectile.mdl",
  2 texture TEXTURE_TP        "Models\\TeleporterGun\\Projectile\\Projectile.tex",
//  3 sound   SOUND_TELEPORT      "Models\\TeleporterGun\\Sounds\\Teleport.wav",

functions:

  // post moving 
  void PostMoving(void)
  {
    CMovableModelEntity::PostMoving();
    // stop rendering of particles when we have stopped moving
    if (en_vCurrentTranslationAbsolute.Length()<0.0001f) {
      m_bParticlesFlying = FALSE;
    }
    // change physics flags 
    if (m_bChangePhysics && _pTimer->CurrentTick()>m_fStartTime) {
      SetPhysicsFlags(EPF_TP);
      m_bChangePhysics = FALSE;
    }
    // flying control
    CBrushSector *pbsc = GetSectorFromPoint(GetPlacement().pl_PositionVector);
    if (pbsc==NULL) {
			//CPrintF("TP is not in a Sector\n");
			// cease to exist
			Destroy();
			return;
		}

  }

  // teleport player
  void TeleportEntity(CEntity *pen, const CPlacement3D &pl)
  {  
    pen->Teleport(pl, FALSE);
  }

  // we don't need no stinking shadows 
  BOOL AdjustShadingParameters(FLOAT3D &vLightDirection, COLOR &colLight, COLOR &colAmbient)
  {
    colAmbient = C_GRAY;
    return FALSE;
  }

  // render particles
  void RenderParticles(void) {
    // if flying render trail
    if (m_bParticlesFlying) {
      Particles_TPTrail(this);
    }
    // if has teleported, render teleporter particles
    if(m_tmSpiritStart!=0.0f) {
      Particles_Death(this, m_tmSpiritStart);
    }
  }

  void Teleport(void) 
  {
    m_bParticlesFlying = FALSE;
    // make model passable
    SwitchToEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);
    GetModelObject()->StretchModel(FLOAT3D(3, 35, 3));
    ModelChangeNotify();

    // get Trans Projectiles Position and Orientation Angle
    CPlacement3D pl;
    pl.pl_PositionVector = GetPlacement().pl_PositionVector;
    pl.pl_OrientationAngle = GetPlacement().pl_OrientationAngle;

    // teleport player to Trans Projectiles Location and Angle
    pl.pl_PositionVector += FLOAT3D(0, 0.1f, 0);
    TeleportEntity(m_penLauncher, CPlacement3D(pl.pl_PositionVector, pl.pl_OrientationAngle));

    // render particles start
    m_tmSpiritStart = _pTimer->CurrentTick();
  }

 /************************************************************
  *                   P R O C E D U R E S                    *
  ************************************************************/

procedures:

  // --->>> MAIN
  Main(ELaunchTP eLaunch) {

    // remember the initial parameters
    ASSERT(eLaunch.penLauncher!=NULL);
    m_penLauncher = eLaunch.penLauncher;

    // initialization
    InitAsModel();
    // fix for the model sticking in the player's back, will change to real physics after 0.01 secs
    SetPhysicsFlags(EPF_MODEL_BOUNCING); 
    SetCollisionFlags(ECF_TP);
    SetModel(MODEL_TP);
		SetModelMainTexture(TEXTURE_TP);
    // stretch model
    //GetModelObject()->StretchModel(FLOAT3D(1.5f, 1.5f, 1.5f));
    //ModelChangeNotify();

    // if owner doesn't exist (could be destroyed in initialization)
    if( eLaunch.penLauncher==NULL) {
      // don't do anything
      Destroy();
      return;
    }

    // prepare particles
    Particles_TPTrail_Prepare(this);

    // remember start time for physics changes
    m_fStartTime = _pTimer->CurrentTick()+0.01f;

    // add player's forward velocity
    CMovableEntity *penPlayer = (CMovableEntity*)(CEntity*)m_penLauncher;
    FLOAT3D vDirection = penPlayer->en_vCurrentTranslationAbsolute;
    FLOAT3D vFront = -GetRotationMatrix().GetColumn(3);
    FLOAT fSpeedFwd = ClampDn( vDirection%vFront, 0.0f);

    //CPrintF("fSpeedFwd: %.3f\n", fSpeedFwd);
    // start moving
    LaunchAsFreeProjectile(FLOAT3D(0.0f, 0.0f, -(100.0f+fSpeedFwd)), (CMovableEntity*)(CEntity*)m_penLauncher);

    // wait for trigger
    wait() {
      on (EBegin) : { resume; }
      on (ETrigger) : { stop; }
    }

    // teleport player
    Teleport();

    // wait for teleport particles
    autowait(3.0f);

    // cease to exist
		Destroy();

    return;
  }
};
