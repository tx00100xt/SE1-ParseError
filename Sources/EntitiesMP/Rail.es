5017
%{
#include "EntitiesMP/StdH/StdH.h"
%}

uses "EntitiesMP/Player";
uses "EntitiesMP/BasicEffects";
uses "EntitiesMP/Projectile";

event ELaunchRail {
  CEntityPointer penLauncher,     // who launched it
	BOOL bSniper,										// sniper?
};

%{
void CRail_OnPrecache(CDLLEntityClass *pdec, INDEX iUser) 
{
  pdec->PrecacheModel(MODEL_RAIL);
  pdec->PrecacheTexture(TEXTURE_RAIL);
}

#define ECF_RAIL ( \
  ((ECBI_MODEL|ECBI_BRUSH|ECBI_PROJECTILE_SOLID|ECBI_CORPSE|ECBI_CORPSE_SOLID|ECBI_MODEL_HOLDER)<<ECB_TEST) |\
  ((ECBI_PROJECTILE_SOLID)<<ECB_IS) |\
  ((ECBI_MODEL|ECBI_PROJECTILE_SOLID)<<ECB_PASS) )
%}

class CRail : CMovableModelEntity {
  name      "Rail";
  thumbnail "";
  features "ImplementsOnPrecache";

properties:

  1 CEntityPointer m_penLauncher,
	2 BOOL  m_bSniper = FALSE,	// sniper bullet?
	3 FLOAT m_tmStarted = 0.0f,

components:
  
  1 model   MODEL_RAIL          "Models\\RailGun\\Projectile\\Ray.mdl",
  2 texture TEXTURE_RAIL        "Models\\RailGun\\Projectile\\Ray.tex",
  3 class   CLASS_BASIC_EFFECT  "Classes\\BasicEffect.ecl",

functions:

  // render particles
  void RenderParticles(void) {
		if (!m_bSniper) {
			Particles_PlasmaBall(this, 0.7f, m_tmStarted);
			Particles_PlasmaTrail(this, 0.1f);
			//Particles_Rail_Trail(this); 
		} else {
			Particles_SWTrail(this);
		}
  };

  // spawn effect
  void SpawnEffect(const CPlacement3D &plEffect, const ESpawnEffect &eSpawnEffect) {
    CEntityPointer penEffect = CreateEntity(plEffect, CLASS_BASIC_EFFECT);
    penEffect->Initialize(eSpawnEffect);
  };

  // projectile touch valid target
  void ProjectileTouch(CEntityPointer penHit)
  {
    // inflict damage
    if (penHit!=m_penLauncher) {
			const FLOAT fDamageMul = GetSeriousDamageMultiplier(m_penLauncher);
      FLOAT3D vDirection = penHit->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.Normalize();
			if (m_bSniper) {
				InflictDirectDamage(penHit, m_penLauncher, DMT_BULLET, 400.0f*fDamageMul,	GetPlacement().pl_PositionVector, vDirection);
			} else {
				InflictDirectDamage(penHit, m_penLauncher, DMT_BULLET, 200.0f*fDamageMul,	GetPlacement().pl_PositionVector, vDirection);
			}
			// kick it back and up
      FLOAT3D vSpeed;      
			if (m_bSniper) {
				GetPitchDirection(AngleDeg(20.0f), vSpeed);
				vSpeed = vSpeed * 200.0f;
			} else {
				GetPitchDirection(AngleDeg(10.0f), vSpeed);
				vSpeed = vSpeed * 50.0f;
			}
      KickEntity(penHit, vSpeed);

			/*if (GetSP()->sp_bSinglePlayer && !m_bSniper) {
				// explosion smoke
				ESpawnEffect ese;
				ese.colMuliplier = C_WHITE|CT_OPAQUE;
				ese.vStretch = FLOAT3D(0.4f,0.4f,0.4f);
				ese.betType = BET_EXPLOSION_SMOKE;
				SpawnEffect(GetPlacement(), ese);
			}*/
    }
  };

  // projectile hit something else
  void ProjectileHit(CEntityPointer penHit)
  {
    // inflict damage
    if (penHit!=m_penLauncher) {
			FLOAT3D vDirection = penHit->GetPlacement().pl_PositionVector-GetPlacement().pl_PositionVector;
      vDirection.Normalize();
			InflictDirectDamage(penHit, m_penLauncher, DMT_CLOSERANGE, 200.0f, GetPlacement().pl_PositionVector, vDirection);
      // explosion effect
			if (m_bSniper) {
				// if brush hit
				if (penHit->GetRenderType()==RT_BRUSH) {
					// find nearest polygon
					FLOAT3D vPoint; 
					FLOATplane3D plPlaneNormal;
					FLOAT fDistanceToEdge;
					CBrushPolygon *pbpo = GetNearestPolygon( vPoint, plPlaneNormal, fDistanceToEdge);
					if (pbpo!=NULL) {
						FLOAT3D vHitNormal = FLOAT3D(pbpo->bpo_pbplPlane->bpl_plAbsolute);
						// obtain surface type
						INDEX iSurfaceType = pbpo->bpo_bppProperties.bpp_ubSurfaceType;
						BulletHitType bhtType = BHT_BRUSH_STONE;
						// get content type
						INDEX iContent = pbpo->bpo_pbscSector->GetContentType();
						CContentType &ct = GetWorld()->wo_actContentTypes[iContent];
        
						bhtType = (BulletHitType) GetBulletHitTypeForSurface(iSurfaceType);
						// if this is under water polygon
						if( ct.ct_ulFlags&CTF_BREATHABLE_GILLS) {
							// if we hit water surface
							if( iSurfaceType==SURFACE_WATER) {
								vHitNormal = -vHitNormal;
								bhtType=BHT_BRUSH_WATER;
							} else { // if we hit stone under water
								bhtType=BHT_BRUSH_UNDER_WATER;
							}
						}
						// spawn hit effect
						BOOL bPassable = pbpo->bpo_ulFlags & (BPOF_PASSABLE|BPOF_SHOOTTHRU);
						if ((!bPassable) || iSurfaceType==SURFACE_WATER ) {
							SpawnHitTypeEffect(this, bhtType, FALSE, vHitNormal, GetPlacement().pl_PositionVector, -vDirection, FLOAT3D(0.0f, 0.0f, 0.0f));
						}
					}
				}
			} else {
				// explosion debris
				ESpawnEffect ese;
				ese.colMuliplier = C_lBLUE|CT_OPAQUE;
				ese.vStretch = FLOAT3D(0.3f,0.3f,0.3f);
				ese.betType = BET_EXPLOSION_DEBRIS2;
				SpawnEffect(GetPlacement(), ese);
			}
    }
  };

 /************************************************************
  *                   P R O C E D U R E S                    *
  ************************************************************/

procedures:

  // --->>> MAIN
  Main(ELaunchRail eLaunch) {

    // remember the initial parameters
    m_penLauncher = eLaunch.penLauncher;
		m_bSniper = eLaunch.bSniper;

    // if owner doesn't exist (could be destroyed in initialization)
    if( eLaunch.penLauncher==NULL) {
      // don't do anything
      Destroy();
      return;
    }

    // initialization
    InitAsModel();
    SetPhysicsFlags(EPF_PROJECTILE_FLYING);
    SetCollisionFlags(ECF_RAIL);
    SetModel(MODEL_RAIL);
		SetModelMainTexture(TEXTURE_RAIL);

		m_tmStarted = _pTimer->CurrentTick();

    // prepare particles
		if (!m_bSniper) {
			//Particles_Rail_Trail_Prepare(this);	
			Particles_PlasmaTrail_Prepare(this);			
		} else {
			Particles_SWTrail_Prepare(this);
		}

    // start moving
		if (m_bSniper) {
			LaunchAsFreeProjectile(FLOAT3D(0.0f, 0.0f, -(300.0f)), (CMovableEntity*)(CEntity*)m_penLauncher);
		} else {
			LaunchAsFreeProjectile(FLOAT3D(0.0f, 0.0f, -(250.0f)), (CMovableEntity*)(CEntity*)m_penLauncher);
		}

    // fly for 5 seconds
    wait(5.0f) {
      on (EBegin) : { resume; }
			// if we hit a valid target
      on (EPass epass) : {        
        BOOL bHit = FALSE;
        // ignore twister and launcher
        if (!(IsOfClass(epass.penOther, "Twister") || IsOfClass(epass.penOther, "Player"))) {
          bHit = TRUE;
        }
				// inflict damage
        if (bHit) {
          ProjectileTouch(epass.penOther);
        }
				if (!m_bSniper) {
					// continue on
					resume;
				} else {
					// we are done
					stop;
				}
      }
			// if we hit something else
      on (ETouch etouch) : {
        ProjectileHit(etouch.penOther);
        stop;
      }
      on (EDeath) : { stop; }
      on (ETimer) : { stop; }
    }

		Destroy();

    return;
  }
};
